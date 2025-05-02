const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const epinSchema = new Schema({
  epin_codes: [{ 
    type: String, 
    required: true, 
    unique: true 
  }],
  value: { 
    type: Number, 
    required: true 
  }, 
  status: { 
    type: String, 
    enum: ['unused', 'used'], 
    default: 'unused' 
  },
  generated_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'generatedByType',  // Reference to the user who generated the Epin (could be admin or user)
    required: true 
  },
  generatedByType :{
    type: String,
    enum: ['usermaster', 'admin'],  
    required: true
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'senderType', // Dynamically reference the sender (can be 'usermaster' or 'admin')
    required: true
  },
  senderType: {
    type: String,
    enum: ['usermaster', 'admin'],  // 'usermaster' or 'admin' as the sender type
    required: true
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'usermaster',  // Reference to the receiver of the Epin
    default: null
  },
  used_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'usermaster', 
    default: null 
  },
  generated_at: { 
    type: Date, 
    default: Date.now 
  },
  used_at: { 
    type: Date, 
    default: null 
  },
}, { timestamps: true });

module.exports = mongoose.model('epin', epinSchema, 'epins');
