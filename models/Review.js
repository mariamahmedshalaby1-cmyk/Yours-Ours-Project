const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true },
  clientId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName:     { type: String, required: true },
  rating:         { type: Number, min: 1, max: 5, required: true },
  text:           { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);