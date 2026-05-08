const express = require('express');
const { z } = require('zod');
const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleGuard');
const validate = require('../middleware/validate');

const router = express.Router();

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().uuid('Invalid project ID'),
  assignedToId: z.string().uuid('Invalid user ID').optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
});

router.use(authenticate);

router.get('/', getTasks);
router.post('/', authorize('ADMIN'), validate(createTaskSchema), createTask);
router.get('/:id', getTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', authorize('ADMIN'), deleteTask);

module.exports = router;
