const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.Mixed, // organizer username or id
    required: true,
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String, // stripe, easypaisa, jazzcash, etc.
    required: true,
  },
  status: {
    type: String, // pending, completed, failed
    default: 'pending',
  },
  transactionId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', PaymentSchema);
