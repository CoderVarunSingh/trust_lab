const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, default: '' },
  city: { type: String, required: true },
  phone: { type: String, default: '' },
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  recommendedLabs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lab' }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
