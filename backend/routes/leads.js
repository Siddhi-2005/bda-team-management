const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getLeadStats,
  getFollowUps,
  getPipeline,
  exportLeads
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Specific subpaths must come BEFORE /:id
router.get('/stats', getLeadStats);
router.get('/follow-ups', getFollowUps);
router.get('/pipeline', getPipeline);
router.get('/export', exportLeads);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(authorize('admin', 'manager'), deleteLead);

module.exports = router;
