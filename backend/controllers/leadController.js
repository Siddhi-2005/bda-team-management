const Lead = require('../models/Lead');

// @desc    Get all leads
// @route   GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const { status, source, assignedTo, team, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;
    if (team) query.team = team;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (req.user.role === 'bda') query.assignedTo = req.user._id;

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name avatar')
      .populate('team', 'name')
      .sort('-createdAt');
    res.json({ success: true, count: leads.length, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name avatar email')
      .populate('team', 'name');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create lead
// @route   POST /api/leads
exports.createLead = async (req, res) => {
  try {
    if (req.user.role === 'bda') {
      req.body.assignedTo = req.user._id;
      if (req.user.team) req.body.team = req.user.team;
    } else if (!req.body.assignedTo) {
      req.body.assignedTo = req.user._id;
    }
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
    const existingLead = await Lead.findById(req.params.id);
    if (!existingLead) return res.status(404).json({ success: false, message: 'Lead not found' });
    if (req.user.role === 'bda' && existingLead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own leads' });
    }
    if (req.user.role === 'bda') {
      delete req.body.assignedTo;
      delete req.body.team;
    }
    if (req.body.status === 'won' || req.body.status === 'lost') {
      req.body.closedDate = new Date();
    }
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
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get lead stats by status
// @route   GET /api/leads/stats
exports.getLeadStats = async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$value' } } }
    ]);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
