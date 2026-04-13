const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  accuracyScore: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
}, { timestamps: true });

// One review per user per lab
reviewSchema.index({ userId: 1, labId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
