const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const visitorCountSchema = new Schema({  
    ip: {
        type: String,
        unique: true,
        required: true
    },
    visitedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('VisitorCount', visitorCountSchema, 'VisitorCounts');
