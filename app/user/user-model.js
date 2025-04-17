const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const userSchema = new Schema({  
    email: {
        type: String,
        default: " "
    },
    password: {
        type: String,
        default: " "
    },   
    tokens: [{
        type: mongoose.Schema.Types.ObjectId,
        default: " ",
        ref: 'Refresh'
    }],
}, { timestamps: true })

module.exports = mongoose.model('usermaster', userSchema, 'usermasters');