const Lab = require('../models/Lab');
const Referral = require('../models/Referral');

// POST /api/doctors/recommend
exports.recommendLab = async (req, res) => {
  try {
    const { labId } = req.body;
    const lab = await Lab.findById(labId);
    if (!lab) return res.status(404).json({ message: 'Lab not found' });

    lab.doctorRecommendations += 1;
    await lab.save();

    res.json({ message: 'Lab recommended successfully', recommendations: lab.doctorRecommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/doctors/refer
exports.referPatient = async (req, res) => {
  try {
    const { patientName, patientPhone, patientEmail, labId, testName, urgency, notes, hospitalId } = req.body;
    const referral = await Referral.create({
      doctorId: req.user._id,
      patientName,
      patientPhone,
      patientEmail,
      labId,
      testName,
      urgency: urgency || 'routine',
      notes,
      hospitalId,
    });
    const populated = await Referral.findById(referral._id)
      .populate('labId', 'name trustScore location')
      .populate('doctorId', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/referrals
exports.getMyReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ doctorId: req.user._id })
      .populate('labId', 'name trustScore location')
      .populate('bookingId')
      .sort({ createdAt: -1 });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/doctors/referrals/:id
exports.updateReferral = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ message: 'Referral not found' });
    Object.assign(referral, req.body);
    await referral.save();
    res.json(referral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
