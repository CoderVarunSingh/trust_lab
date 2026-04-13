/**
 * Trust Score Engine
 * Formula: trustScore = (rating * 0.4 + accuracy * 0.3 + doctorRec * 0.15 + hospitalRec * 0.1 + consistency * 0.05) * 20
 * 
 * All inputs normalized to 0-5 scale before computation
 * Output: 0-100 score
 */

const calculateTrustScore = ({ rating = 0, accuracy = 0, doctorRec = 0, hospitalRec = 0, consistency = 0 }) => {
  // Clamp all values to 0-5
  const clamp = (v) => Math.max(0, Math.min(5, v));

  const score = (
    clamp(rating) * 0.4 +
    clamp(accuracy) * 0.3 +
    clamp(doctorRec) * 0.15 +
    clamp(hospitalRec) * 0.1 +
    clamp(consistency) * 0.05
  ) * 20;

  return Math.round(score * 10) / 10; // 1 decimal
};

const getTrustTier = (score) => {
  if (score >= 80) return { label: 'Reliable', emoji: '✅', color: 'green' };
  if (score >= 50) return { label: 'Average', emoji: '⚠️', color: 'amber' };
  return { label: 'Risky', emoji: '❌', color: 'red' };
};

module.exports = { calculateTrustScore, getTrustTier };
