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
    if (search) query.name = { $regex: search, $options: 'i' };
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
    const user = await User.findById(req.params.id).populate('team', 'name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create user
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
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
    const originalUser = await User.findById(req.params.id);
    if (!originalUser) return res.status(404).json({ success: false, message: 'User not found' });
    
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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
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
