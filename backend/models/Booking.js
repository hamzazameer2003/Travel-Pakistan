const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // Tourist who made the booking
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  touristName: {
    type: String,
    required: true,
  },
  touristEmail: {
    type: String,
    required: true,
  },
  touristPhone: {
    type: String,
    required: true,
  },

  // Tour being booked
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: true,
  },
  tourTitle: {
    type: String,
    required: true,
  },
  tourPrice: {
    type: Number,
    required: true,
  },

  // Organizer details
  organizer: {
    type: String, // organizer username
    required: true,
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Booking details
  seatsBooked: {
    type: Number,
    required: true,
    min: 1,
  },
  totalAmount: {
    type: Number,
    required: true,
  },

  // Payment details
  paymentIntentId: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: 'stripe',
  },

  // Booking status
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'cancelled'],
    default: 'confirmed',
  },

  // Additional info
  specialRequests: {
    type: String,
    default: '',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Tour date
  tourDate: {
    type: Date,
    required: true,
  },
});

// Index for efficient querying
BookingSchema.index({ tourist: 1, status: 1 });
BookingSchema.index({ organizer: 1, status: 1 });
BookingSchema.index({ tour: 1, status: 1 });
BookingSchema.index({ paymentIntentId: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
