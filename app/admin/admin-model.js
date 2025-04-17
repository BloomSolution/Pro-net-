const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const adminSchema = new Schema({ 
    name:{
        type: String,
        default: " " 
    }, 
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

module.exports = mongoose.model('admin', adminSchema, 'admins');