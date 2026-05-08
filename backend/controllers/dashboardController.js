const prisma = require('../config/db');

// GET /api/dashboard/stats
async function getStats(req, res) {
  const isAdmin = req.user.role === 'ADMIN';
  const userId = req.user.id;

  // Build where clause based on role
  const projectWhere = isAdmin ? {} : { members: { some: { userId } } };
  const taskWhere = isAdmin
    ? {}
    : {
        OR: [
          { assignedToId: userId },
          { project: { members: { some: { userId } } } },
        ],
      };

  // Get counts
  const [totalProjects, totalTasks, completedTasks, inProgressTasks, todoTasks] =
    await Promise.all([
      prisma.project.count({ where: projectWhere }),
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...taskWhere, status: 'TODO' } }),
    ]);

  const overdueTasks = await prisma.task.count({
    where: {
      ...taskWhere,
      dueDate: { lt: new Date() },
      status: { not: 'COMPLETED' },
    },
  });

  const pendingTasks = todoTasks + inProgressTasks;

  // Tasks by status for pie chart
  const tasksByStatus = [
    { name: 'To Do', value: todoTasks, color: '#6366f1' },
    { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
    { name: 'Completed', value: completedTasks, color: '#10b981' },
  ];

  // Project progress for bar chart
  const projects = await prisma.project.findMany({
    where: projectWhere,
    select: {
      id: true,
      title: true,
      tasks: { select: { status: true } },
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  const projectProgress = projects.map((p) => {
    const total = p.tasks.length;
    const completed = p.tasks.filter((t) => t.status === 'COMPLETED').length;
    return {
      name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
      total,
      completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  // Recent tasks
  const recentTasks = await prisma.task.findMany({
    where: taskWhere,
    include: {
      project: { select: { title: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  res.json({
    success: true,
    data: {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksByStatus,
      projectProgress,
      recentTasks,
    },
  });
}

// GET /api/dashboard/overdue
async function getOverdueTasks(req, res) {
  const isAdmin = req.user.role === 'ADMIN';
  const userId = req.user.id;

  const where = {
    dueDate: { lt: new Date() },
    status: { not: 'COMPLETED' },
  };

  if (!isAdmin) {
    where.OR = [
      { assignedToId: userId },
      { project: { members: { some: { userId } } } },
    ];
  }

  const overdueTasks = await prisma.task.findMany({
    where,
    include: {
      project: { select: { id: true, title: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  res.json({ success: true, data: overdueTasks });
}

module.exports = { getStats, getOverdueTasks };
