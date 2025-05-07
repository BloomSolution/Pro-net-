const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({ 
        user: [{
                type: mongoose.Schema.Types.ObjectId,
                default:null,
                ref: 'usermaster'
        }],
        flyers:[{
            type:String,
            default:" ",   
            set:(file)=>{
                if(file){
                    return file  
                }
                return ;
            },          
        }],
        ppt:[{
            type:String,
            default:" ",   
            set:(file)=>{
                if(file){
                    return file  
                }
                return ;
            },                   
        }],
        agreement:{
            type:String,
            default:" ",   
            set:(file)=>{
                if(file){
                    return file  
                }
                return ;
            },         
        },
        video:[{
            type:String,
            default:" ",   
            set:(file)=>{
                if(file){
                    return file  
                }
                return ;
            },         
        }],



        
}, { timestamps: true });

module.exports = mongoose.model('file', fileSchema, 'files');
