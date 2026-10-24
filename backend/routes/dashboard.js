const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/stats')
  .get(getDashboardStats);

router.route('/activity')
  .get(getRecentActivity);

module.exports = router;
