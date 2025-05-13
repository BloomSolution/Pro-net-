const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  schdule_date:{
    type: Date,
    default: null,
    validate: {
            validator: function (date) {
                return !date || moment(date).isValid();
            },
            message: 'Invalid date format schdule date!',
        },
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['General','Updates','Promotions', 'Alerts','System'],
    required: true
  },
  user: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usermaster',
    required: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('news', newsSchema, 'newses');
