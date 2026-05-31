const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({

    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',                            
        required: true
    },

    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional',                    
        required: true
    },

    service: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    isEmergency: {
        type: Boolean,
        default: false
    },

    scheduledTime: {
        type: String,
        required: true
    },

    address: {
        neighborhood: { type: String, required: true },
        street:       { type: String, required: true },
        apartment:    { type: String, default: '' },
        landmark:     { type: String, default: '' }
    },

    photo: {
        type: String,
        default: ''
    },

    pin: {
        type: String
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending'
    }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);