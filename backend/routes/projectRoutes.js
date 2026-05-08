const express = require('express');
const { z } = require('zod');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleGuard');
const validate = require('../middleware/validate');

const router = express.Router();

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
});

router.use(authenticate);

router.get('/', getProjects);
router.post('/', authorize('ADMIN'), validate(projectSchema), createProject);
router.get('/:id', getProject);
router.put('/:id', authorize('ADMIN'), validate(projectSchema), updateProject);
router.delete('/:id', authorize('ADMIN'), deleteProject);

module.exports = router;
