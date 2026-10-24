const express = require('express');
const router = express.Router();
const { getLeads, getLead, createLead, updateLead, deleteLead, getLeadStats } = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/stats')
  .get(getLeadStats);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(authorize('admin', 'manager'), deleteLead);

module.exports = router;
