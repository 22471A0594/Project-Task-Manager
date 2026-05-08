const express = require('express');
const { z } = require('zod');
const { addMember, removeMember, getUsers } = require('../controllers/memberController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleGuard');
const validate = require('../middleware/validate');

const router = express.Router();

const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

router.use(authenticate);

router.get('/users', getUsers);
router.post('/projects/:id/members', authorize('ADMIN'), validate(addMemberSchema), addMember);
router.delete('/projects/:id/members/:userId', authorize('ADMIN'), removeMember);

module.exports = router;
