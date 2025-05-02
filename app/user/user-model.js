const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const userSchema = new Schema({  
    name:{
        type: String,
        default: " " 
    },
    email: {
        type: String,
        default: " ",
        lowercase: true,
        trim: true
    },  
    user_address:{
        type: String,
        default: " "
    },
    phone_no:{
        type: String,
        default: " "
    },
    age:{
        type: Number,
        default: null,
        min: 0
    },
    gender:{
        type: String,
        enum: ["Male", "Female", "Other", ""],
        default: ""
    },
    dob:{
        type: Date,
        default: null,
        validate: [
            {
            validator: function (date) {
                return !date || moment(date).isValid(); 
            },
            message: 'Invalid date format for DOB!'
            },
            {
            validator: function (date) {
                if (!date) return true; 
                const age = moment().diff(moment(date), 'years');
                return age >= 18;
            },
            message: 'User must be at least 18 years old.'
            }
        ]
    },
    state:{
        type: String,
        default: ""
    },
    city:{
        type: String,
        default: ""
    },
    aadhar_no:{
        type: Number,
        default: 0
    },
    password: {
        type: String,
        default: " "
    },
    user_blocked_status:{
        type: String,
        default: " "
    }, 
    user_status:{
        type: String,
        default: "Inactive"
    },
    subscription_date:[{
                        type: Date,
                        default: null,
                        validate: {
                            validator: function (date) {
                                return !date || moment(date).isValid();
                            },
                            message: 'Invalid date format for subscription date!',
                        },
    }],
    bonus_of_subscription:[{
        type: Number,
        default: 0
    }],
    total_bonus:{
        type: Number,
        default: 0
    },
    amount_of_subscription:[{
        type: Number,
        default: 0
    }],
    point_value_of_subscription:[{
        type: Number,
        default: 0
    }],
    subscription_end_date:[{
        type: Date,
        default: null,
        validate: {
            validator: function (date) {
                return !date || moment(date).isValid();
            },
            message: 'Invalid date format for subscription end date!',
        },
    }],
    tokens: [{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'Refresh'
    }],
    user_activate_admin_id:[{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'admin'
    }],
    user_inActivate_admin_id:[{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'admin'
    }],
    wallet_info:{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'wallet'
    },
    referred_by_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usermaster',
        default: null
    },
    referrals:[{
        type: mongoose.Schema.Types.ObjectId,
        default:null,
        ref: 'usermaster'
    }],
    files:[{
        type: mongoose.Schema.Types.ObjectId,
        default:null,
        ref: 'file'
    }],
    epins:[{
        type: mongoose.Schema.Types.ObjectId,
        default:null,
        ref: 'epin' 
    }]
}, { timestamps: true })

module.exports = mongoose.model('usermaster', userSchema, 'usermasters');