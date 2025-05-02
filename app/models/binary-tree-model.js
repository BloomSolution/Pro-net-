const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const binaryReferralSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usermaster',
        required: true,
        unique: true
    },
    left: {
        type: Schema.Types.ObjectId,
        ref: 'usermaster',
        default: null
    },
    right: {
        type: Schema.Types.ObjectId,
        ref: 'usermaster',
        default: null
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'usermaster',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('BinaryReferral', binaryReferralSchema);
