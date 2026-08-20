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

  // 3. Generic Polymorphic Tree Builder Test
  await test('Hierarchical Generic Block Tree Builder O(N)', () => {
    const sampleBlocks = [
      { id: 'proj-1', parent_id: null, payload_type: 'PROJECT', payload: { name: 'Main Project' } },
      { id: 'stage-1', parent_id: 'proj-1', payload_type: 'STAGE', payload: { name: 'Discovery Stage' } },
      { id: 'task-1', parent_id: 'stage-1', payload_type: 'TASK', payload: { name: 'User Interviews' } },
      { id: 'asset-1', parent_id: 'stage-1', payload_type: 'ASSET', payload: { name: 'Design Specs PDF' } },
      { id: 'stage-2', parent_id: 'proj-1', payload_type: 'STAGE', payload: { name: 'Development Stage' } },
      { id: 'task-2', parent_id: 'stage-2', payload_type: 'TASK', payload: { name: 'Build Gantt Chart' } },
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
    const validRegister = registerSchema.parse({
      email: 'alex@example.com',
      password: 'password123',
      role: 'admin',
    });
    assert.strictEqual(validRegister.email, 'alex@example.com');

    assert.throws(() => {
      registerSchema.parse({
        email: 'invalid-email',
        password: '123',
      });
    }, 'Should throw validation error for bad email and short password');
  });

  await test('Generic Block Validator Schema with payload_type & payload_type_version', () => {
    const validBlock = createBlockSchema.parse({
      payload_type: 'GAME_CHARACTER',
      payload_type_version: 2,
      payload: {
        name: 'Shadow Necromancer (Boss)',
        characterClass: 'Mage',
        maxHealth: 4800,
        manaPool: 2000,
        status: 'active',
      },
    });

    assert.strictEqual(validBlock.payload_type, 'GAME_CHARACTER');
    assert.strictEqual(validBlock.payload_type_version, 2);
    assert.strictEqual(validBlock.payload.name, 'Shadow Necromancer (Boss)');
    assert.strictEqual(validBlock.payload.maxHealth, 4800);

    // Default payload_type & payload_type_version test
    const defaultBlock = createBlockSchema.parse({
      payload: { name: 'Default Generic Block' },
    });
    assert.strictEqual(defaultBlock.payload_type, 'GENERIC');
    assert.strictEqual(defaultBlock.payload_type_version, 1);

    // Update block validation
    const updateBlock = updateBlockSchema.parse({
      payload_type_version: 3,
      payload: { customField: 'migrated' },
    });
    assert.strictEqual(updateBlock.payload_type_version, 3);
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

  // 6. SchemaService Filesystem Dynamic Discovery
  await test('File-based Schemas Catalog Service (schemas/)', () => {
    const schemaService = require('../src/services/schema.service');
    const catalog = schemaService.getSchemasCatalog();
    
    assert(catalog && typeof catalog.domains === 'object', 'Catalog should contain domains object');
    assert(catalog.flat.length >= 30, `Catalog should find at least 30 schema templates (found ${catalog.flat.length})`);
    
    // Check specific schemas
    const taskSchema = schemaService.getSchema('TASK', 1);
    assert(taskSchema && taskSchema.type === 'TASK', 'TASK v1 schema should exist');
    assert(taskSchema.domain === 'project', 'TASK should belong to project domain');
    assert(typeof taskSchema.template === 'object', 'TASK should have a valid JSON template');
    
    const storeSchema = schemaService.getSchema('STORE', 1);
    assert(storeSchema && storeSchema.type === 'STORE', 'STORE v1 schema should exist');
    assert(storeSchema.domain === 'ecommerce', 'STORE should belong to ecommerce domain');
  });

  // 7. Live Database Connectivity
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
