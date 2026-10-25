const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Team = require('../models/Team');

const managerCanTouch = (actor, target) => {
  if (target.role === 'admin') return false;
  if (target._id.toString() === actor._id.toString()) return true;
  if (!target.team) return target.role === 'bda';           // unassigned BDA
  return !!actor.team && target.team.toString() === actor.team.toString() && target.role === 'bda';
};

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escaped, $options: 'i' };
    }

    // Manager sees only their own team members + unassigned users (candidates to recruit)
    if (req.user.role === 'manager') {
      const roleFilter = query.role && query.role !== 'admin' ? query.role : { $ne: 'admin' };
      const teamFilter = req.user.team
        ? { $or: [{ team: req.user.team }, { team: null }] }
        : { $or: [{ _id: req.user._id }, { team: null }] };
      query = { $and: [{ ...query, role: roleFilter }, teamFilter] };
    }

    const users = await User.find(query).populate('team', 'name').sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = await User.findById(req.params.id).populate('team', 'name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.user.role === 'manager' && !managerCanTouch(req.user, user)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create user
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
    // Manager cannot create admin accounts
    if (req.user.role === 'manager') {
      if (req.body.role && req.body.role !== 'bda') {
        return res.status(403).json({ success: false, message: 'Managers can only create BDA accounts' });
      }
      req.body.role = 'bda';                 // managers can only create BDAs
      req.body.team = req.user.team;         // ...into their own team
    }

    const user = await User.create(req.body);
    
    // Sync with Team members array if user is assigned to a team
    if (user.team) {
      await Team.findByIdAndUpdate(user.team, { $addToSet: { members: user._id } });
    }
    
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const originalUser = await User.findById(req.params.id);
    if (!originalUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Manager cannot modify admin accounts
    if (req.user.role === 'manager') {
      if (!managerCanTouch(req.user, originalUser)) {
        return res.status(403).json({ success: false, message: 'You can only modify BDAs in your team or unassigned BDAs' });
      }
      // Managers cannot promote, move people to other teams, or edit sensitive fields
      delete req.body.role;
      delete req.body.isActive;
      if (req.body.team && req.body.team.toString() !== req.user.team?.toString()) delete req.body.team;
    }

    // Admin cannot demote themselves
    if (req.user._id.toString() === req.params.id && req.body.role && req.body.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Administrators cannot demote their own account' });
    }

    // Hash password if updating password
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    
    // Sync with Team members array if team assignment changes
    const teamChanging = Object.prototype.hasOwnProperty.call(req.body, 'team');
    const oldTeamId = originalUser.team?.toString();
    const newTeamId = req.body.team ? req.body.team.toString() : undefined;
    if (teamChanging && !newTeamId) { delete req.body.team; req.body.$unset = { team: 1 }; }

    if (teamChanging && oldTeamId !== newTeamId) {
      if (oldTeamId) {
        await Team.findByIdAndUpdate(oldTeamId, { $pull: { members: originalUser._id } });
      }
      if (newTeamId) {
        await Team.findByIdAndUpdate(newTeamId, { $addToSet: { members: originalUser._id } });
      }
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('team', 'name');
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Admin cannot delete themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'Administrators cannot delete their own account' });
    }

    // Managers can only delete BDAs in their own team
    if (req.user.role === 'manager' && !(managerCanTouch(req.user, user) && user.team)) {
      return res.status(403).json({ success: false, message: 'Managers can only delete BDAs in their own team' });
    }
    
    // Pull from Team members array if user was in a team
    if (user.team) {
      await Team.findByIdAndUpdate(user.team, { $pull: { members: user._id } });
    }
    
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
