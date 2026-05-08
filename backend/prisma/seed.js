const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@projectpilot.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@projectpilot.com',
      password: hashedPassword,
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Bob Wilson',
      email: 'bob@projectpilot.com',
      password: hashedPassword,
      role: 'MEMBER',
    },
  });

  console.log('✅ Users created');

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      title: 'E-Commerce Platform',
      description: 'Build a modern e-commerce platform with React and Node.js. Features include product catalog, shopping cart, payment integration, and order management.',
      createdById: admin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Mobile Banking App',
      description: 'Design and develop a secure mobile banking application with real-time transaction tracking, bill payments, and account management.',
      createdById: admin.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      title: 'HR Management System',
      description: 'Internal HR management tool for employee onboarding, leave management, performance reviews, and payroll processing.',
      createdById: admin.id,
    },
  });

  console.log('✅ Projects created');

  // Add members to projects
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: admin.id },
      { projectId: project1.id, userId: member1.id },
      { projectId: project1.id, userId: member2.id },
      { projectId: project2.id, userId: admin.id },
      { projectId: project2.id, userId: member1.id },
      { projectId: project3.id, userId: admin.id },
      { projectId: project3.id, userId: member2.id },
    ],
  });

  console.log('✅ Project members added');

  // Create tasks
  const now = new Date();
  const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const futureDate3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      // Project 1 tasks
      {
        title: 'Design product catalog UI',
        description: 'Create wireframes and high-fidelity mockups for the product listing and detail pages.',
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: pastDate,
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Implement shopping cart API',
        description: 'Build RESTful APIs for cart management including add, remove, update quantity, and checkout.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: futureDate1,
        projectId: project1.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
      {
        title: 'Setup payment gateway',
        description: 'Integrate Stripe payment gateway for secure online payments.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: futureDate2,
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Write unit tests for cart',
        description: 'Comprehensive unit tests for shopping cart functionality.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: futureDate3,
        projectId: project1.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
      // Project 2 tasks
      {
        title: 'Design authentication flow',
        description: 'Design secure biometric and PIN-based authentication for the banking app.',
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: pastDate,
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Build transaction history',
        description: 'Implement real-time transaction feed with filtering and search capabilities.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: futureDate1,
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Implement bill payments',
        description: 'Add support for utility bill payments, mobile recharge, and scheduled payments.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: pastDate,
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      // Project 3 tasks
      {
        title: 'Employee onboarding module',
        description: 'Build digital onboarding workflow with document upload and verification.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: futureDate2,
        projectId: project3.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
      {
        title: 'Leave management system',
        description: 'Implement leave request, approval workflow, and balance tracking.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: futureDate3,
        projectId: project3.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment pipeline.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: pastDate,
        projectId: project3.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
    ],
  });

  console.log('✅ Tasks created');
  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('  Admin: admin@projectpilot.com / password123');
  console.log('  Member 1: jane@projectpilot.com / password123');
  console.log('  Member 2: bob@projectpilot.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
