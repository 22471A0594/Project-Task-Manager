const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { signToken } = require('../config/jwt');
const ApiError = require('../utils/ApiError');

// POST /api/auth/signup
async function signup(req, res) {
  const { name, email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'MEMBER',
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken({ id: user.id, role: user.role });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user, token },
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ id: user.id, role: user.role });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    },
  });
}

// GET /api/auth/me
async function getMe(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          createdProjects: true,
          assignedTasks: true,
          memberships: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: user,
  });
}

module.exports = { signup, login, getMe };
