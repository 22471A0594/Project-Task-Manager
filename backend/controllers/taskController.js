const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

// GET /api/tasks
async function getTasks(req, res) {
  const { projectId, status, priority, search, overdue } = req.query;

  const where = {};

  // Role-based scoping
  if (req.user.role === 'MEMBER') {
    where.OR = [
      { assignedToId: req.user.id },
      { project: { members: { some: { userId: req.user.id } } } },
    ];
  }

  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }
  if (overdue === 'true') {
    where.dueDate = { lt: new Date() };
    where.status = { not: 'COMPLETED' };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: { select: { id: true, title: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: tasks });
}

// POST /api/tasks
async function createTask(req, res) {
  const { title, description, status, priority, dueDate, projectId, assignedToId } = req.body;

  // Verify project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  // Verify assignee is a member if specified
  if (assignedToId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: assignedToId } },
    });
    if (!isMember) {
      throw ApiError.badRequest('Assigned user is not a member of this project');
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      assignedToId: assignedToId || null,
      createdById: req.user.id,
    },
    include: {
      project: { select: { id: true, title: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
}

// GET /api/tasks/:id
async function getTask(req, res) {
  const { id } = req.params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, title: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  res.json({ success: true, data: task });
}

// PUT /api/tasks/:id
async function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, assignedToId } = req.body;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  // Members can only update status of their own tasks
  if (req.user.role === 'MEMBER') {
    if (task.assignedToId !== req.user.id) {
      throw ApiError.forbidden('You can only update tasks assigned to you');
    }
    // Members can only change status
    const updated = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    return res.json({
      success: true,
      message: 'Task status updated',
      data: updated,
    });
  }

  // Admin can update everything
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;

  const updated = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      project: { select: { id: true, title: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: updated,
  });
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  const { id } = req.params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  await prisma.task.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
}

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask };
