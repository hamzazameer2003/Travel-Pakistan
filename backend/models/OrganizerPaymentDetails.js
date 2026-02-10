const mongoose = require('mongoose');

const OrganizerPaymentDetailsSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paymentType: {
    type: String,
    enum: ['bank', 'easypaisa', 'jazzcash'],
    required: true,
  },
  accountDetails: {
    type: mongoose.Schema.Types.Mixed, // encrypted object with account number, title, etc.
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('OrganizerPaymentDetails', OrganizerPaymentDetailsSchema);
