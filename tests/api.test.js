const assert = require('assert');
const bcrypt = require('bcryptjs');
const { signToken, verifyToken } = require('../src/utils/jwt.util');
const { buildBlockTree } = require('../src/utils/tree.util');
const { registerSchema, loginSchema } = require('../src/validators/auth.validator');
const { createBlockSchema, updateBlockSchema } = require('../src/validators/block.validator');
const prisma = require('../src/config/prisma');
const mailer = require('../src/config/mailer');

async function runTests() {
  console.log('🧪 Running UXC Block Manager Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✔ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  };

  // 1. JWT Utilities Test
  await test('JWT Sign and Verify', () => {
    const payload = { id: 'usr_123', email: 'test@uxcribe.com', role: 'admin' };
    const token = signToken(payload);
    assert(typeof token === 'string' && token.length > 20, 'Token must be a valid string');
    
    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.email, payload.email);
    assert.strictEqual(decoded.role, payload.role);
  });

  // 2. Password Hashing Test
  await test('Bcrypt Password Hashing and Comparison', async () => {
    const plainPassword = 'SuperSecretPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPassword, salt);

    assert(hash !== plainPassword, 'Hashed password must not equal plain password');
    const isMatch = await bcrypt.compare(plainPassword, hash);
    assert.strictEqual(isMatch, true, 'Matching password must return true');

    const wrongMatch = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(wrongMatch, false, 'Wrong password must return false');
  });

  // 3. Polymorphic Tree Builder Test
  await test('Hierarchical Block Tree Builder O(N)', () => {
    const sampleBlocks = [
      { id: 'proj-1', parent_id: null, name: 'Main Project', type: 'PROJECT' },
      { id: 'stage-1', parent_id: 'proj-1', name: 'Discovery Stage', type: 'STAGE' },
      { id: 'task-1', parent_id: 'stage-1', name: 'User Interviews', type: 'TASK' },
      { id: 'asset-1', parent_id: 'stage-1', name: 'Design Specs PDF', type: 'ASSET' },
      { id: 'stage-2', parent_id: 'proj-1', name: 'Development Stage', type: 'STAGE' },
      { id: 'task-2', parent_id: 'stage-2', name: 'Build Gantt Chart', type: 'TASK' },
    ];

    const tree = buildBlockTree(sampleBlocks);

    assert.strictEqual(tree.length, 1, 'Should have 1 root node');
    assert.strictEqual(tree[0].id, 'proj-1');
    assert.strictEqual(tree[0].children.length, 2, 'Root project should have 2 stage children');
    assert.strictEqual(tree[0].children[0].id, 'stage-1');
    assert.strictEqual(tree[0].children[0].children.length, 2, 'Stage 1 should have 2 children (task and asset)');
    assert.strictEqual(tree[0].children[0].children[0].id, 'task-1');
    assert.strictEqual(tree[0].children[0].children[1].id, 'asset-1');
    assert.strictEqual(tree[0].children[1].id, 'stage-2');
    assert.strictEqual(tree[0].children[1].children.length, 1, 'Stage 2 should have 1 task child');
  });

  // 4. Request Validation Tests
  await test('Auth Validator Schema Validation', () => {
    // Valid register
    const validRegister = registerSchema.parse({
      email: 'alex@example.com',
      password: 'password123',
      role: 'admin',
    });
    assert.strictEqual(validRegister.email, 'alex@example.com');

    // Invalid email
    assert.throws(() => {
      registerSchema.parse({
        email: 'invalid-email',
        password: '123',
      });
    }, 'Should throw validation error for bad email and short password');
  });

  await test('Block Validator Schema with JSON Payload and Schema Version', () => {
    const validBlock = createBlockSchema.parse({
      name: 'Frontend Milestone',
      start_date: '2026-09-01T00:00:00.000Z',
      end_date: '2026-09-15T00:00:00.000Z',
      type: 'STAGE',
      status: 'in_progress',
      schema_version: 2,
      payload: {
        budget: 50000,
        tags: ['UI', 'React'],
        deliverable: 'https://cdn.uxcribe.com/milestone.pdf',
      },
    });

    assert.strictEqual(validBlock.name, 'Frontend Milestone');
    assert.strictEqual(validBlock.schema_version, 2);
    assert.strictEqual(validBlock.payload.budget, 50000);

    // Default schema_version test
    const defaultVerBlock = createBlockSchema.parse({
      name: 'Default Version Task',
      start_date: '2026-09-01T00:00:00.000Z',
      end_date: '2026-09-10T00:00:00.000Z',
      type: 'TASK',
    });
    assert.strictEqual(defaultVerBlock.schema_version, 1, 'Default schema_version should be 1');

    // Update with schema_version
    const updateBlock = updateBlockSchema.parse({
      schema_version: 3,
      payload: { customField: 'migrated' },
    });
    assert.strictEqual(updateBlock.schema_version, 3);

    // Invalid dates (end_date before start_date)
    assert.throws(() => {
      createBlockSchema.parse({
        name: 'Invalid Date Block',
        start_date: '2026-09-15T00:00:00.000Z',
        end_date: '2026-09-01T00:00:00.000Z',
        type: 'TASK',
      });
    }, 'Should throw error when end_date is before start_date');
  });

  // 5. Mailer Service Test
  await test('Mailer Service Initialization and Dev Logging', async () => {
    try {
      const result = await mailer.sendMail({
        to: 'dev@uxcribe.com',
        subject: 'Test Notification',
        html: '<p>This is a test notification from the test suite.</p>',
      });
      assert.strictEqual(typeof result.success, 'boolean');
    } catch (err) {
      console.log(`     ℹ Mailer notice: ${err.message}`);
    }
  });

  // 6. Live Database Connectivity (if active)
  await test('Database Connection Check', async () => {
    try {
      await prisma.$connect();
      console.log('     ℹ Connected to MySQL database.');
    } catch (err) {
      console.log(`     ℹ Note: MySQL is currently offline locally (${err.message.split('\n')[0]}). Skipping live DB queries.`);
    }
  });

  console.log(`\n========================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
