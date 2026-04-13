const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  testName: { type: String, required: true, trim: true },
  category: { type: String, default: 'General' },
  price: { type: Number, required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  reportTime: { type: Number, default: 24 }, // hours
  description: { type: String, default: '' },
  popular: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
