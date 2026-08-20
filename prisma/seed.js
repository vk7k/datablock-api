const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

async function seed() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.block.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', salt);
  const userPasswordHash = await bcrypt.hash('UserPass123!', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@uxcribe.com',
      password_hash: adminPasswordHash,
      role: 'admin',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@uxcribe.com',
      password_hash: userPasswordHash,
      role: 'user',
    },
  });

  console.log(`👤 Created users: ${admin.email} (admin), ${user.email} (user)`);

  // Create Generic Polymorphic Block Hierarchy
  const now = new Date();
  const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  // 1. Root Project
  const project = await prisma.block.create({
    data: {
      payload_type: 'PROJECT',
      payload_type_version: 1,
      payload: {
        name: 'Enterprise Cloud Platform Redesign',
        status: 'in_progress',
        start_date: now.toISOString(),
        end_date: addDays(now, 60),
        client: 'Acme Global Corp',
        budget: 150000,
        currency: 'USD',
        manager: 'Sarah Jenkins',
        priority: 'HIGH',
        gantt: {
          color: '#38bdf8',
          collapsed: false,
          criticalPath: true,
        },
      },
    },
  });

  // 2. Stage 1 (under Project)
  const stage1 = await prisma.block.create({
    data: {
      parent_id: project.id,
      payload_type: 'STAGE',
      payload_type_version: 1,
      payload: {
        name: 'Stage 1: Discovery & Architecture',
        status: 'completed',
        start_date: now.toISOString(),
        end_date: addDays(now, 15),
        stageNumber: 1,
        lead: 'Alex Rivera',
        deliverablesCount: 4,
      },
    },
  });

  // 2.1 Task under Stage 1
  await prisma.block.create({
    data: {
      parent_id: stage1.id,
      payload_type: 'TASK',
      payload_type_version: 1,
      payload: {
        name: 'User Interviews & Workflow Analysis',
        status: 'completed',
        start_date: now.toISOString(),
        end_date: addDays(now, 7),
        due_date: addDays(now, 7),
        assignee: 'Elena Rostova',
        storyPoints: 8,
        progress: 100,
        tags: ['UX', 'Research', 'Discovery'],
      },
    },
  });

  // 2.2 Asset under Stage 1
  await prisma.block.create({
    data: {
      parent_id: stage1.id,
      payload_type: 'ASSET',
      payload_type_version: 1,
      payload: {
        name: 'Architecture Specification PDF',
        status: 'completed',
        start_date: addDays(now, 8),
        end_date: addDays(now, 15),
        fileUrl: 'https://cdn.uxcribe.com/docs/arch-spec-v1.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 4820000,
        version: '1.0.0',
      },
    },
  });

  // 3. Stage 2 (under Project)
  const stage2 = await prisma.block.create({
    data: {
      parent_id: project.id,
      payload_type: 'STAGE',
      payload_type_version: 1,
      payload: {
        name: 'Stage 2: Frontend & API Implementation',
        status: 'in_progress',
        start_date: addDays(now, 16),
        end_date: addDays(now, 45),
        stageNumber: 2,
        lead: 'Marcus Vance',
        deliverablesCount: 8,
      },
    },
  });

  // 3.1 Task under Stage 2
  await prisma.block.create({
    data: {
      parent_id: stage2.id,
      payload_type: 'TASK',
      payload_type_version: 1,
      payload: {
        name: 'Build Gantt Chart Visualization Components',
        status: 'in_progress',
        start_date: addDays(now, 16),
        end_date: addDays(now, 30),
        due_date: addDays(now, 30),
        assignee: 'David Kim',
        storyPoints: 13,
        progress: 60,
        tags: ['Frontend', 'React', 'Gantt'],
        dependencies: ['Stage 1: Discovery & Architecture'],
      },
    },
  });

  // 3.2 Contract under Stage 2
  await prisma.block.create({
    data: {
      parent_id: stage2.id,
      payload_type: 'CONTRACT',
      payload_type_version: 1,
      payload: {
        name: 'Vendor Service Level Agreement (SLA)',
        status: 'pending',
        start_date: addDays(now, 20),
        end_date: addDays(now, 45),
        vendorName: 'CloudScale Systems LLC',
        contractValue: 35000,
        currency: 'USD',
        autoRenew: true,
      },
    },
  });

  console.log('✅ Seed completed successfully! Created generic polymorphic project tree:');
  console.log(`- Project: ${project.payload?.name} (${project.id})`);
  console.log(`  |- Stage 1: ${stage1.payload?.name} (with 1 Task, 1 Asset)`);
  console.log(`  |- Stage 2: ${stage2.payload?.name} (with 1 Task, 1 Contract)`);
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
