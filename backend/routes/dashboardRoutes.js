const express = require('express');
const { getStats, getOverdueTasks } = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/stats', getStats);
router.get('/overdue', getOverdueTasks);

module.exports = router;
