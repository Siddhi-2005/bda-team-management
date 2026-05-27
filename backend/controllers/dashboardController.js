const User = require('../models/User');
const Team = require('../models/Team');
const Task = require('../models/Task');
const Lead = require('../models/Lead');

const emptyQuery = { _id: null };

const getDashboardScope = (user) => {
  if (user.role === 'admin') {
    return {
      userQuery: { isActive: true },
      teamQuery: { isActive: true },
      taskQuery: {},
      leadQuery: {}
    };
  }

  if (user.role === 'manager') {
    if (!user.team) {
      return {
        userQuery: { _id: user._id, isActive: true },
        teamQuery: emptyQuery,
        taskQuery: { assignedBy: user._id },
        leadQuery: { assignedTo: user._id }
      };
    }

    return {
      userQuery: { isActive: true, team: user.team },
      teamQuery: { isActive: true, _id: user.team },
      taskQuery: { team: user.team },
      leadQuery: { team: user.team }
    };
  }

  return {
    userQuery: { _id: user._id, isActive: true },
    teamQuery: user.team ? { isActive: true, _id: user.team } : emptyQuery,
    taskQuery: { assignedTo: user._id },
    leadQuery: { assignedTo: user._id }
  };
};

// @desc    Get dashboard summary stats
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const { userQuery, teamQuery, taskQuery, leadQuery } = getDashboardScope(req.user);

    const [totalUsers, totalTeams, totalTasks, totalLeads] = await Promise.all([
      User.countDocuments(userQuery),
      Team.countDocuments(teamQuery),
      Task.countDocuments(taskQuery),
      Lead.countDocuments(leadQuery)
    ]);

    const [tasksByStatus, leadsByStatus, wonLeads] = await Promise.all([
      Task.aggregate([
        { $match: taskQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: leadQuery },
        { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$value' } } }
      ]),
      Lead.aggregate([
        { $match: { ...leadQuery, status: 'won' } },
        { $group: { _id: null, total: { $sum: '$value' } } }
      ])
    ]);

    const totalRevenue = wonLeads.length > 0 ? wonLeads[0].total : 0;

    // Monthly leads for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyLeads = await Lead.aggregate([
      { $match: { ...leadQuery, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          value: { $sum: '$value' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top performers
    const topPerformers = await Lead.aggregate([
      { $match: { ...leadQuery, status: 'won' } },
      { $group: { _id: '$assignedTo', wonDeals: { $sum: 1 }, revenue: { $sum: '$value' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', avatar: '$user.avatar', wonDeals: 1, revenue: 1 } }
    ]);

    // Team performance
    let teamPerformance = await Team.find(teamQuery)
      .select('name target achieved')
      .lean();

    if (teamPerformance.length === 0 && req.user.role !== 'admin') {
      teamPerformance = [{
        name: `${req.user.name} Target`,
        target: req.user.salesTarget || 0,
        achieved: totalRevenue
      }];
    }

    res.json({
      success: true,
      stats: {
        totalUsers, totalTeams, totalTasks, totalLeads, totalRevenue,
        tasksByStatus, leadsByStatus, monthlyLeads, topPerformers, teamPerformance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
exports.getRecentActivity = async (req, res) => {
  try {
    const { taskQuery, leadQuery } = getDashboardScope(req.user);

    const recentLeads = await Lead.find(leadQuery).sort('-createdAt').limit(5)
      .populate('assignedTo', 'name avatar').select('name status value assignedTo createdAt');
    const recentTasks = await Task.find(taskQuery).sort('-createdAt').limit(5)
      .populate('assignedTo', 'name avatar').select('title status priority assignedTo createdAt');
    res.json({ success: true, recentLeads, recentTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
