const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'new'
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'cold_call', 'social_media', 'event', 'other'],
    default: 'other'
  },
  value: {
    type: Number,
    default: 0
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  notes: {
    type: String,
    default: '',
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  followUpDate: {
    type: Date
  },
  closedDate: {
    type: Date
  },
  tags: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
