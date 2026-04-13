const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  status: {
    type: String,
    enum: ['booked', 'confirmed', 'sample_collected', 'testing', 'report_ready', 'delivered', 'rejected'],
    default: 'booked',
  },
  timeSlot: { type: String, required: true },
  date: { type: Date, required: true },
  homeCollection: { type: Boolean, default: false },
  address: { type: String, default: '' },
  trackingUpdates: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  }],
  totalAmount: { type: Number, default: 0 },
  reportUrl: { type: String, default: '' },
  rejected: { type: Boolean, default: false },
  rejectionReason: { type: String, default: '' },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // doctor/hospital who referred
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
