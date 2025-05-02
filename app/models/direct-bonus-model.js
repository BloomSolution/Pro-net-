const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const directBonusSchema = new Schema({ 
        user: {
                type: mongoose.Schema.Types.ObjectId,
                default:null,
                ref: 'usermaster'
            },
        directRefferalUser:{
                            type: mongoose.Schema.Types.ObjectId,
                            default:null,
                            ref: 'usermaster'
                        },
        refferal_subscription_date:{
                                    type: Date,
                                    default: null,
                                    validate: {
                                        validator: function (date) {
                                            return !date || moment(date).isValid();
                                        },
                                        message: 'Invalid date format for refferal subscription date!',
                                    },
                                },
        pointValue:{
                    type: Number,
                    default: 0
        },
        bonus_amount:{
                    type: Number,
                    default: 0
        }
}, { timestamps: true });

module.exports = mongoose.model('directBonus', directBonusSchema, 'directBonuses');
