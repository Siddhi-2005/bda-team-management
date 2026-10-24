const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTeams)
  .post(authorize('admin', 'manager'), createTeam);

router.route('/:id')
  .get(getTeam)
  .put(authorize('admin', 'manager'), updateTeam)
  .delete(authorize('admin'), deleteTeam);

router.route('/:id/members')
  .put(authorize('admin', 'manager'), addMember);

router.route('/:id/members/:userId')
  .delete(authorize('admin', 'manager'), removeMember);

module.exports = router;
