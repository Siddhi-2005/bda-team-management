const Team = require('../models/Team');
const User = require('../models/User');
const Lead = require('../models/Lead');

// Admin: all teams. Manager: teams they manage (+ their own). BDA: only their own team.
const teamScope = (user) => {
  if (user.role === 'admin') return {};
  if (user.role === 'manager') {
    return user.team ? { $or: [{ manager: user._id }, { _id: user.team }] } : { manager: user._id };
  }
  return user.team ? { _id: user.team } : { _id: null };
};

// Only admin, or the manager of that team, may change it.
const canManageTeam = async (user, teamId) => {
  if (user.role === 'admin') return true;
  if (user.role !== 'manager') return false;
  const team = await Team.findById(teamId).select('manager');
  return !!team && team.manager.toString() === user._id.toString();
};

// @desc    Get all teams
// @route   GET /api/teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find(teamScope(req.user))
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role')
      .sort('-createdAt')
      .lean();

    if (teams.length > 0) {
      const teamIds = teams.map((t) => t._id);
      const wonAgg = await Lead.aggregate([
        { $match: { team: { $in: teamIds }, status: 'won' } },
        { $group: { _id: '$team', totalAchieved: { $sum: '$value' } } }
      ]);
      const wonMap = new Map(wonAgg.map((w) => [String(w._id), w.totalAchieved]));
      teams.forEach((t) => {
        t.achieved = wonMap.get(String(t._id)) || 0;
      });
    }

    res.json({ success: true, count: teams.length, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ $and: [{ _id: req.params.id }, teamScope(req.user)] })
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar role')
      .lean();
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const wonAgg = await Lead.aggregate([
      { $match: { team: team._id, status: 'won' } },
      { $group: { _id: null, totalAchieved: { $sum: '$value' } } }
    ]);
    team.achieved = wonAgg.length > 0 ? wonAgg[0].totalAchieved : 0;

    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create team
// @route   POST /api/teams
exports.createTeam = async (req, res) => {
  try {
    // A manager can only create a team that they manage themselves
    if (req.user.role === 'manager') req.body.manager = req.user._id;
    const members = new Set((req.body.members || []).map(String));
    members.add(String(req.body.manager));
    req.body.members = [...members];
    const team = await Team.create(req.body);
    await User.updateMany({ _id: { $in: req.body.members } }, { team: team._id });
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
    if (!(await canManageTeam(req.user, req.params.id))) {
      return res.status(403).json({ success: false, message: 'You can only edit a team you manage' });
    }
    if (req.user.role !== 'admin') { delete req.body.manager; delete req.body.members; }
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
    if (!(await canManageTeam(req.user, req.params.id))) {
      return res.status(403).json({ success: false, message: 'You can only add members to a team you manage' });
    }
    const target = await User.findById(userId);
    if (!target || target.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Invalid user' });
    }
    // Move user out of any previous team so a person is never in two teams
    if (target.team && target.team.toString() !== req.params.id) {
      await Team.findByIdAndUpdate(target.team, { $pull: { members: target._id } });
    }
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
    if (!(await canManageTeam(req.user, req.params.id))) {
      return res.status(403).json({ success: false, message: 'You can only remove members from a team you manage' });
    }
    const t = await Team.findById(req.params.id).select('manager');
    if (t && t.manager.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the team manager' });
    }
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
