const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Team manager is required']
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  target: {
    type: Number,
    default: 0
  },
  achieved: {
    type: Number,
    default: 0
  },
  region: {
    type: String,
    default: 'North'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

TeamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

TeamSchema.virtual('performance').get(function() {
  if (this.target === 0) return 0;
  return Math.round((this.achieved / this.target) * 100);
});

module.exports = mongoose.model('Team', TeamSchema);
