const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  numDays: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  category: {
    type: String,
    default: 'Adventure',
  },
  organizer: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Tour', TourSchema);
