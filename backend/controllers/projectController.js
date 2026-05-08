const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

// GET /api/projects
async function getProjects(req, res) {
  let projects;

  if (req.user.role === 'ADMIN') {
    projects = await prisma.project.findMany({
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } },
        tasks: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true, members: true } },
        tasks: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Add progress calculation
  const projectsWithProgress = projects.map((project) => {
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const { tasks, ...rest } = project;
    return { ...rest, progress, completedTasks, totalTasks };
  });

  res.json({ success: true, data: projectsWithProgress });
}

// POST /api/projects
async function createProject(req, res) {
  const { title, description } = req.body;

  const project = await prisma.project.create({
    data: {
      title,
      description,
      createdById: req.user.id,
      members: {
        create: { userId: req.user.id },
      },
    },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
}

// GET /api/projects/:id
async function getProject(req, res) {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true, role: true } },
      tasks: {
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { joinedAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  // Members can only view projects they belong to
  if (req.user.role === 'MEMBER') {
    const isMember = project.members.some((m) => m.userId === req.user.id);
    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this project');
    }
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.json({
    success: true,
    data: { ...project, progress, completedTasks, totalTasks },
  });
}

// PUT /api/projects/:id
async function updateProject(req, res) {
  const { id } = req.params;
  const { title, description } = req.body;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  const updated = await prisma.project.update({
    where: { id },
    data: { title, description },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: updated,
  });
}

// DELETE /api/projects/:id
async function deleteProject(req, res) {
  const { id } = req.params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  await prisma.project.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
}

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject };
