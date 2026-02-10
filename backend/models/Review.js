const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  // Review for tour
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: false, // Not required for organizer ratings
  },

  // Review by tourist
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  touristName: {
    type: String,
    required: true,
  },

  // Review content
  reviewText: {
    type: String,
    required: true,
    maxlength: 500,
  },

  // Rating for organizer (1-5 stars)
  organizerRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  // Reference to organizer being rated
  organizer: {
    type: String,
    required: true, // Organizer username
  },

  // Review metadata
  reviewType: {
    type: String,
    enum: ['tour_review', 'organizer_rating'],
    default: 'tour_review',
  },

  isPublic: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
ReviewSchema.index({ tour: 1, createdAt: -1 });
ReviewSchema.index({ organizer: 1, createdAt: -1 });
ReviewSchema.index({ tourist: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
