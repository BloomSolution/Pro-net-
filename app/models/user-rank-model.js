const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rankSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usermaster',
    required: true
  },
  user_rank_name: [{
    type: String,
    default:" ", 
  }],
  user_rank_date: [{
    type: Date,
    default: null,
    validate: {
            validator: function (date) {
                return !date || moment(date).isValid();
            },
            message: 'Invalid date format user rank date!',
        },
  }],

}, { timestamps: true });

module.exports = mongoose.model('rank', rankSchema, 'ranks');
