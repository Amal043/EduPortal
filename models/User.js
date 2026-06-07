const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Synced dashboard data
  dashboardData: {
    savedOpportunities: {
      type: Array,
      default: []
    },
    applicationTracking: {
      type: Array,
      default: []
    },
    deadlines: {
      type: Array,
      default: []
    },
    reminders: {
      type: Array,
      default: []
    },
    userPreferences: {
      type: Object,
      default: {
        categories: [],
        educationLevel: '',
        branch: '',
        state: ''
      }
    }
  }
});

module.exports = mongoose.model('User', UserSchema);
