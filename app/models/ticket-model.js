const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usermaster',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'account', 'payment', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'closed'],
    default: 'open'
  },
  response: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('ticket', ticketSchema);
