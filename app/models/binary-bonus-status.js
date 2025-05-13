const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const binaryBonusStatusSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usermaster',
    required: true,
    unique: true
  },
  leftActive: {
    type: Number,
    default: 0
  },
  rightActive: {
    type: Number,
    default: 0
  },
  leftCarry: {
    type: Number,
    default: 0
  },
  rightCarry: {
    type: Number,
    default: 0
  },
  lastBonusDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('BinaryBonusStatus', binaryBonusStatusSchema);
