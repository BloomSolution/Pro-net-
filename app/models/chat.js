const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'usermaster'
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'admin'
  },
  message: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
