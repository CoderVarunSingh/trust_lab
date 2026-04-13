const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, default: '' },
  patientEmail: { type: String, default: '' },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  testName: { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  urgency: { type: String, enum: ['routine', 'urgent', 'emergency'], default: 'routine' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'booked', 'completed', 'cancelled'], default: 'pending' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
