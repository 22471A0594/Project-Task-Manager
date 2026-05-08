const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

// POST /api/projects/:id/members
async function addMember(req, res) {
  const { id } = req.params;
  const { userId } = req.body;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId } },
  });

  if (existingMember) {
    throw ApiError.conflict('User is already a member of this project');
  }

  const member = await prisma.projectMember.create({
    data: { projectId: id, userId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Member added successfully',
    data: member,
  });
}

// DELETE /api/projects/:id/members/:userId
async function removeMember(req, res) {
  const { id, userId } = req.params;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId } },
  });

  if (!membership) {
    throw ApiError.notFound('Member not found in this project');
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId: id, userId } },
  });

  // Unassign tasks from removed member in this project
  await prisma.task.updateMany({
    where: { projectId: id, assignedToId: userId },
    data: { assignedToId: null },
  });

  res.json({
    success: true,
    message: 'Member removed successfully',
  });
}

// GET /api/users (for adding members)
async function getUsers(req, res) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: 'asc' },
  });

  res.json({ success: true, data: users });
}

module.exports = { addMember, removeMember, getUsers };
