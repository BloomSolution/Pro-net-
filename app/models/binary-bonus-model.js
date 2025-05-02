const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const binaryBonusSchema = new Schema({ 
  user: {
         type: mongoose.Schema.Types.ObjectId,
         default: " ",
         ref: 'usermaster'
  },
  user_rank:[{ 
    rank_name:{type: String,default: " "},
    rank_date:{type: Date,default: null,
                            validate: {
                                validator: function (date) {
                                    return !date || moment(date).isValid();
                                },
                                message: 'Invalid date format for subscription date!',
                            },
    },
    team_commision:{},
    rewards:{},
    life_style_fund_name:{}
  }]


}, { timestamps: true });

module.exports = mongoose.model('binaryBonus', binaryBonusSchema, 'binaryBonuses');
