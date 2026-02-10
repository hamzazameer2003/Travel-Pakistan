const mongoose = require('mongoose');

const PrivateTourSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true,
  },
  numPeople: {
    type: Number,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PrivateTour', PrivateTourSchema);
