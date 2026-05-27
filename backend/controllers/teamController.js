const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Get all teams
// @route   GET /api/teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role')
      .sort('-createdAt');
    res.json({ success: true, count: teams.length, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create team
// @route   POST /api/teams
exports.createTeam = async (req, res) => {
  try {
    const team = await Team.create(req.body);
    // Update manager's team field
    await User.findByIdAndUpdate(req.body.manager, { team: team._id });
    const populated = await Team.findById(team._id)
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role');
    res.status(201).json({ success: true, team: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, team });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to team
// @route   PUT /api/teams/:id/members
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('manager', 'name email avatar').populate('members', 'name email avatar role');
    await User.findByIdAndUpdate(userId, { team: req.params.id });
    res.json({ success: true, team });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
exports.removeMember = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.params.userId } },
      { new: true }
    ).populate('manager', 'name email avatar').populate('members', 'name email avatar role');
    await User.findByIdAndUpdate(req.params.userId, { $unset: { team: 1 } });
    res.json({ success: true, team });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
