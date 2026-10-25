const mongoose = require('mongoose');
const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, team } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (team) query.team = team;

    // Role-based scoping
    if (req.user.role === 'bda') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'manager' && req.user.team) {
      query.team = req.user.team;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name avatar email')
      .populate('assignedBy', 'name avatar')
      .populate('team', 'name')
      .sort('-createdAt');
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name avatar email')
      .populate('assignedBy', 'name avatar')
      .populate('team', 'name');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role === 'bda' && task.assignedTo?._id?.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (req.user.role === 'manager' && req.user.team && task.team?._id?.toString() !== req.user.team.toString()) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    req.body.assignedBy = req.user._id;
    if (req.user.role === 'bda') {
      req.body.assignedTo = req.user._id;
      if (req.user.team) req.body.team = req.user.team;
    }
    const task = await Task.create(req.body);
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name avatar')
      .populate('assignedBy', 'name avatar')
      .populate('team', 'name');
    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.user.role === 'bda' && existingTask.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (req.user.role === 'manager' && req.user.team && existingTask.team?.toString() !== req.user.team.toString()) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role === 'bda') {
      delete req.body.assignedTo;
      delete req.body.assignedBy;
      delete req.body.team;
    }
    if (req.body.status === 'done') req.body.completedAt = new Date();
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name avatar')
      .populate('assignedBy', 'name avatar')
      .populate('team', 'name');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role === 'bda') {
      return res.status(403).json({ success: false, message: 'BDAs cannot delete tasks' });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
