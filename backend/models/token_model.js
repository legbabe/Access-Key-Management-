const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        length: 100,
        unique: true
    },
    userEmail: {
        type: String,
        required: true,
    },
    proc_date: {
        type: Date,
        default: Date.now,
        
    },
    expiryDate: {
        type: Date,
        default: function() {
            const currentDate = new Date();
            return new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        },
    },
    tokenStatus: {
        type: String,
        enum: ['active', 'expired', 'revoked'],
        default: 'active'
    }
});

const Token = mongoose.model('token', tokenSchema);

module.exports = Token;