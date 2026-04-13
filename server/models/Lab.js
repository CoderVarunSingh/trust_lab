const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location: {
    city: { type: String, required: true },
    area: { type: String, default: '' },
    address: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
  },
  trustScore: { type: Number, default: 0, min: 0, max: 100 },
  ratings: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  reportConsistency: { type: Number, default: 0, min: 0, max: 5 },
  accreditedBy: [{ type: String }],
  homeCollection: { type: Boolean, default: false },
  operatingHours: { type: String, default: '8:00 AM - 8:00 PM' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  image: { type: String, default: '' },
  photos: [{ type: String }],
  doctorRecommendations: { type: Number, default: 0 },
  hospitalRecommendations: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  staff: [{
    name: { type: String, required: true },
    role: { type: String, enum: ['doctor', 'technician', 'receptionist', 'phlebotomist'], default: 'technician' },
    specialization: { type: String, default: '' },
    phone: { type: String, default: '' },
    assignedTests: [{ type: String }],
  }],
}, { timestamps: true });

labSchema.methods.getTrustTier = function () {
  if (this.trustScore >= 80) return { label: 'Reliable', emoji: '✅', color: 'green' };
  if (this.trustScore >= 50) return { label: 'Average', emoji: '⚠️', color: 'amber' };
  return { label: 'Risky', emoji: '❌', color: 'red' };
};

module.exports = mongoose.model('Lab', labSchema);
