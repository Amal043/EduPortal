const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  // Core fields
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  source: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  url: { type: String, required: true },
  category: { type: String, default: 'General' },
  type: {
    type: String,
    enum: ['scholarship', 'internship', 'hackathon', 'workshop', 'news'],
    default: 'scholarship'
  },
  icon: { type: String, default: '🎓' },
  amount: { type: String, default: '' },
  isNational: { type: Boolean, default: true },

  // Dynamic deadline: store only month (1-12) and day (1-31)
  // The year is computed dynamically so it's always in the future
  deadlineMonth: { type: Number, min: 1, max: 12, default: null },
  deadlineDay: { type: Number, min: 1, max: 31, default: null },

  // For news-type items: actual fixed date
  publishedAt: { type: Date, default: null },

  // Engagement analytics
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },

  // Computed trend score (updated on every interaction)
  trendScore: { type: Number, default: 0 },

  // Meta
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  lastRefreshed: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast trending queries
OpportunitySchema.index({ trendScore: -1, type: 1 });
OpportunitySchema.index({ isActive: 1, type: 1 });

// Virtual: compute dynamic deadline string
OpportunitySchema.virtual('deadlineDisplay').get(function () {
  if (!this.deadlineMonth || !this.deadlineDay) return 'Rolling basis';
  const now = new Date();
  let year = now.getFullYear();
  const target = new Date(year, this.deadlineMonth - 1, this.deadlineDay);
  // If the date has already passed this year, push to next year
  if (target < now) year += 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[this.deadlineMonth - 1]} ${this.deadlineDay}, ${year}`;
});

OpportunitySchema.set('toJSON', { virtuals: true });
OpportunitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Opportunity', OpportunitySchema);
