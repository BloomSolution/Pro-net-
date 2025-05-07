const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fixedBonusSchema = new Schema({ 
    user: {
            type: mongoose.Schema.Types.ObjectId,
            default:null,
            ref: 'usermaster'
    },
    fixed_bonus:{
        type: Number,
        default: 0
    },
    fixed_bonus_Point_value:{
        type: Number,
        default: 0
    },
    high_performance_team_receive_bonus:{
        type: Number,
        default: 0
    },
    User_final_bonus:{
        type: Number,
        default: 0
    }
    
}, { timestamps: true });

module.exports = mongoose.model('fixedBonus', fixedBonusSchema, 'fixedBonuses');
