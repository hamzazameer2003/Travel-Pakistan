const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Message delivery status
  deliveredAt: {
    type: Date,
    default: null, // Set when recipient connects and receives the message
  },
  readAt: {
    type: Date,
    default: null, // Set when recipient opens the chat and sees the message
  },
  messageId: {
    type: String,
    required: true, // Unique ID for client-side tracking
    unique: true,
  },
});

module.exports = mongoose.model('Message', MessageSchema);
