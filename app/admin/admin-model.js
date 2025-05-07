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
    phone_no:{
        type: String,
        default: " "
    },
    profile_img:{
        type:String,
        default:" ",   
        set:(file)=>{
            if(file){
                return file  
            }
            return ;
        },              
    },
    tokens: [{
        type: mongoose.Schema.Types.ObjectId,
        default:null,
        ref: 'Refresh'
    }],
    epins: [{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'epin' 
    }],
}, { timestamps: true })

module.exports = mongoose.model('admin', adminSchema, 'admins');