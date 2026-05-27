const User = require('../models/User');
const Team = require('../models/Team');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const clampNumber = (value, min, max) => {
  const number = Number(value) || 0;
  return Math.min(Math.max(number, min), max);
};

const createOnboardingData = async (user, data) => {
  const salesTarget = clampNumber(data.salesTarget, 0, 100000000);
  const activeTaskCount = clampNumber(data.activeTaskCount, 0, 20);
  const openLeadCount = clampNumber(data.openLeadCount, 0, 50);
  const pipelineValue = clampNumber(data.pipelineValue, 0, 100000000);
  const wonRevenue = clampNumber(data.wonRevenue, 0, 100000000);
  const region = data.region || 'North';
  const teamNameBase = data.teamName || `${user.name} Sales Workspace`;
  const teamName = `${teamNameBase} - ${user._id.toString().slice(-5)}`;

  const team = await Team.create({
    name: teamName,
    description: `Onboarding workspace for ${user.name}`,
    manager: user._id,
    members: [user._id],
    target: salesTarget,
    achieved: wonRevenue,
    region
  });

  user.team = team._id;
  await user.save();

  const taskStatuses = ['todo', 'inprogress', 'review'];
  const tasks = Array.from({ length: activeTaskCount }, (_, index) => ({
    title: `Onboarding follow-up ${index + 1}`,
    description: 'Starter task created from registration setup. Update it with the real customer action.',
    status: taskStatuses[index % taskStatuses.length],
    priority: index === 0 ? 'high' : 'medium',
    assignedTo: user._id,
    assignedBy: user._id,
    team: team._id,
    dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
    tags: ['onboarding']
  }));

  if (tasks.length > 0) {
    await Task.insertMany(tasks);
  }

  const openLeadValue = openLeadCount > 0 ? Math.round(pipelineValue / openLeadCount) : 0;
  const leadStatuses = ['new', 'contacted', 'qualified', 'proposal'];
  const leads = Array.from({ length: openLeadCount }, (_, index) => ({
    name: `Starter Lead ${index + 1}`,
    company: data.department || 'New Prospect',
    status: leadStatuses[index % leadStatuses.length],
    source: 'other',
    value: openLeadValue,
    assignedTo: user._id,
    team: team._id,
    notes: 'Starter lead created from registration setup. Replace with the actual prospect details.',
    followUpDate: new Date(Date.now() + (index + 2) * 24 * 60 * 60 * 1000),
    tags: ['onboarding']
  }));

  if (wonRevenue > 0) {
    leads.push({
      name: 'Existing Won Business',
      company: data.department || 'Existing Account',
      status: 'won',
      source: 'other',
      value: wonRevenue,
      assignedTo: user._id,
      team: team._id,
      notes: 'Initial closed revenue entered during registration setup.',
      closedDate: new Date(),
      tags: ['onboarding']
    });
  }

  if (leads.length > 0) {
    await Lead.insertMany(leads);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      department,
      region,
      salesTarget,
      teamName,
      activeTaskCount,
      openLeadCount,
      pipelineValue,
      wonRevenue
    } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'bda',
      phone,
      department,
      region,
      salesTarget
    });

    if (user.role === 'bda') {
      await createOnboardingData(user, {
        department,
        region,
        salesTarget,
        teamName,
        activeTaskCount,
        openLeadCount,
        pipelineValue,
        wonRevenue
      });
    }

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        department: user.department,
        region: user.region,
        salesTarget: user.salesTarget,
        team: user.team
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        department: user.department,
        region: user.region,
        salesTarget: user.salesTarget,
        team: user.team
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('team', 'name');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, department, region, salesTarget, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, department, region, salesTarget, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
