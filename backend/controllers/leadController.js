const mongoose = require('mongoose');
const Lead = require('../models/Lead');

// @desc    Get all leads
// @route   GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const { status, source, assignedTo, team, search, overdue } = req.query;
    let query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;
    if (team) query.team = team;

    if (search) {
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escaped, $options: 'i' };
    }

    if (overdue === 'true') {
      query.followUpDate = { $lt: new Date() };
      query.status = { $nin: ['won', 'lost'] };
    }

    if (req.user.role === 'bda') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'manager' && req.user.team) {
      query.team = req.user.team;
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name avatar email')
      .populate('team', 'name')
      .sort('-createdAt');
    res.json({ success: true, count: leads.length, total: leads.length, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name avatar email')
      .populate('team', 'name');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (req.user.role === 'bda' && lead.assignedTo?._id?.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    if (req.user.role === 'manager' && req.user.team && lead.team?._id?.toString() !== req.user.team.toString()) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create lead
// @route   POST /api/leads
exports.createLead = async (req, res) => {
  try {
    if (req.body.value !== undefined && Number(req.body.value) < 0) {
      return res.status(400).json({ success: false, message: 'Deal value cannot be negative' });
    }

    if (req.user.role === 'bda') {
      req.body.assignedTo = req.user._id;
      if (req.user.team) req.body.team = req.user.team;
    } else if (!req.body.assignedTo) {
      req.body.assignedTo = req.user._id;
    }
    
    // Initialize activity trail
    req.body.activities = [{
      action: `Lead created with status '${req.body.status || 'new'}'`,
      performedBy: req.user.name || 'Sales User',
      timestamp: new Date()
    }];

    const lead = await Lead.create(req.body);
    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name avatar')
      .populate('team', 'name');
    res.status(201).json({ success: true, lead: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const existingLead = await Lead.findById(req.params.id);
    if (!existingLead) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (req.user.role === 'bda' && existingLead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    if (req.user.role === 'manager' && req.user.team && existingLead.team?.toString() !== req.user.team.toString()) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (req.body.value !== undefined && Number(req.body.value) < 0) {
      return res.status(400).json({ success: false, message: 'Deal value cannot be negative' });
    }

    if (req.user.role === 'bda') {
      delete req.body.assignedTo;
      delete req.body.team;
    }

    // Strip incoming forged activities
    delete req.body.activities;

    if (req.body.status === 'won' || req.body.status === 'lost') {
      req.body.closedDate = new Date();
    }

    // Track activity trail on update
    const newActivities = existingLead.activities ? [...existingLead.activities] : [];
    if (req.body.status && req.body.status !== existingLead.status) {
      newActivities.push({
        action: `Status changed from '${existingLead.status}' to '${req.body.status.toUpperCase()}'`,
        performedBy: req.user.name || 'Sales User',
        timestamp: new Date()
      });
    }
    if (req.body.value !== undefined && Number(req.body.value) !== Number(existingLead.value)) {
      newActivities.push({
        action: `Deal value updated to ₹${Number(req.body.value).toLocaleString()}`,
        performedBy: req.user.name || 'Sales User',
        timestamp: new Date()
      });
    }
    req.body.activities = newActivities;

    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name avatar')
      .populate('team', 'name');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    if (req.user.role === 'bda') {
      return res.status(403).json({ success: false, message: 'BDAs cannot delete leads' });
    }

    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get follow ups (overdue & upcoming bucketed)
// @route   GET /api/leads/follow-ups
exports.getFollowUps = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'bda') query.assignedTo = req.user._id;
    else if (req.user.role === 'manager' && req.user.team) query.team = req.user.team;

    const now = new Date();
    const overdueQuery = {
      ...query,
      followUpDate: { $lt: now },
      status: { $nin: ['won', 'lost'] }
    };
    const upcomingQuery = {
      ...query,
      followUpDate: { $gte: now },
      status: { $nin: ['won', 'lost'] }
    };

    const [overdue, upcoming] = await Promise.all([
      Lead.find(overdueQuery).populate('assignedTo', 'name avatar email').populate('team', 'name').sort('followUpDate'),
      Lead.find(upcomingQuery).populate('assignedTo', 'name avatar email').populate('team', 'name').sort('followUpDate')
    ]);

    res.json({
      success: true,
      counts: {
        overdue: overdue.length,
        upcoming: upcoming.length
      },
      overdue,
      upcoming
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get 7-stage pipeline breakdown
// @route   GET /api/leads/pipeline
exports.getPipeline = async (req, res) => {
  try {
    let match = {};
    if (req.user.role === 'bda') match.assignedTo = req.user._id;
    else if (req.user.role === 'manager' && req.user.team) match.team = req.user.team;

    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const aggregated = await Lead.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$value' } } }
    ]);

    const stageMap = {};
    aggregated.forEach(a => {
      stageMap[a._id] = { count: a.count, totalValue: a.totalValue };
    });

    const pipeline = stages.map(stage => ({
      stage,
      count: stageMap[stage]?.count || 0,
      totalValue: stageMap[stage]?.totalValue || 0
    }));

    res.json({ success: true, pipeline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export leads to CSV (with formula injection protection)
// @route   GET /api/leads/export
exports.exportLeads = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'bda') query.assignedTo = req.user._id;
    else if (req.user.role === 'manager' && req.user.team) query.team = req.user.team;

    const leads = await Lead.find(query).populate('assignedTo', 'name email').populate('team', 'name');

    // Neutralise formula injection by prefixing with ' if string starts with =, +, -, @
    const sanitize = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (/^[=\-+@]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Source', 'Value', 'Assigned To', 'Team', 'Follow Up Date'];
    const rows = leads.map(l => [
      sanitize(l.name),
      sanitize(l.company),
      sanitize(l.email),
      sanitize(l.phone),
      sanitize(l.status),
      sanitize(l.source),
      sanitize(l.value),
      sanitize(l.assignedTo?.name || ''),
      sanitize(l.team?.name || ''),
      sanitize(l.followUpDate ? l.followUpDate.toISOString().split('T')[0] : '')
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get lead stats by status
// @route   GET /api/leads/stats
exports.getLeadStats = async (req, res) => {
  try {
    let match = {};
    if (req.user.role === 'bda') match.assignedTo = req.user._id;
    else if (req.user.role === 'manager' && req.user.team) match.team = req.user.team;

    const stats = await Lead.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$value' } } }
    ]);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
