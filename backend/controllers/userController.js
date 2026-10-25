const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Team = require('../models/Team');

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

    // Manager cannot see admin accounts
    if (req.user.role === 'manager') {
      query.role = { $ne: 'admin' };
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

    if (req.user.role === 'manager' && user.role === 'admin') {
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
    if (req.user.role === 'manager' && req.body.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Managers cannot create admin accounts' });
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
    if (req.user.role === 'manager' && originalUser.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Managers cannot modify admin accounts' });
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
    const oldTeamId = originalUser.team?.toString();
    const newTeamId = req.body.team?.toString();
    
    if (oldTeamId !== newTeamId) {
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

    // Manager cannot delete admin accounts
    if (req.user.role === 'manager' && user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Managers cannot delete admin accounts' });
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
