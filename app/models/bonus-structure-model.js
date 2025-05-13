const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const levelSchema = new Schema({
  level: { type: String, required: true, unique: true }, //  "IGINATOR", "SPARK", "RISER" etc 
  // direct_bonus: { type: Number, default: 0 },
  // teamBonus: { type: Number, default: 0 },
  // monthly_target: { type: Number,default: 0 },
  // monthly_bonus: { type: Number, default: 0 },
  binary_bonus: { type: Number, default: 0 }
});

const globalBonusSchema = new Schema({
  direct_bonus_percent: { type: Number, default: 0 },
  monthly_bonus_percent: { type: Number, default: 0 },
  //lifestyleFundPercent: { type: Number, default: 0 },
  jewellery_fund_percent:{type: Number, default: 0 },
  travel_fund_percentage:{type: Number, default: 0 },
  car_fund_percentage:{type: Number, default: 0 },
  house_fund_percentage:{type: Number, default: 0 },
  levelStructure: [levelSchema] // array of levels
}, { timestamps: true });

module.exports = mongoose.model('BonusStructure', globalBonusSchema);
