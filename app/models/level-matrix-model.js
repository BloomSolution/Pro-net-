const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const levelMatrixSchema = new Schema({ 
    user: {
            type: mongoose.Schema.Types.ObjectId,
            default: " ",
            ref: 'usermaster'
    },
    level1:[{    
            type: mongoose.Schema.Types.ObjectId,
            default: " ",
            ref: 'usermaster'
    }],
    level2:[{
            type: mongoose.Schema.Types.ObjectId,
                default: " ",
                ref: 'usermaster'
    }],
    level3:[{
            type: mongoose.Schema.Types.ObjectId,
            default: " ",
            ref: 'usermaster'
    }],
    level4:[{
            type: mongoose.Schema.Types.ObjectId,
            default: " ",
            ref: 'usermaster'
    }],
    level5:[{
            type: mongoose.Schema.Types.ObjectId,
            default: " ",
            ref: 'usermaster'
    }],
    level6:[{
            type: mongoose.Schema.Types.ObjectId,
            default: " ",
            ref: 'usermaster'
    }],    
}, { timestamps: true });

module.exports = mongoose.model('levelMatrix', levelMatrixSchema, 'levelMatrices');
