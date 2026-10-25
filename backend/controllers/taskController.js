const mongoose = require('mongoose');
const Task = require('../models/Task');
const { taskScope, inScope, resolveAssignee } = require('../utils/scope');

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

    // Role-based scoping (cannot be overridden by query params)
    const scope = taskScope(req.user);
    query = Object.keys(scope).length ? { $and: [query, scope] } : query;

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

    if (!inScope(task, req.user)) {
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
    const { assignedTo, team } = await resolveAssignee(req.user, req.body.assignedTo);
    req.body.assignedBy = req.user._id;
    req.body.assignedTo = assignedTo;
    req.body.team = team;
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

    if (!inScope(existingTask, req.user)) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    delete req.body.assignedBy;
    delete req.body.team;
    if (req.user.role === 'bda') {
      delete req.body.assignedTo;
    } else if (req.body.assignedTo && req.body.assignedTo !== existingTask.assignedTo?.toString()) {
      const resolved = await resolveAssignee(req.user, req.body.assignedTo);
      req.body.assignedTo = resolved.assignedTo;
      req.body.team = resolved.team;
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

    const existing = await Task.findById(req.params.id);
    if (!existing || !inScope(existing, req.user)) return res.status(404).json({ success: false, message: 'Task not found' });
    const task = await existing.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
