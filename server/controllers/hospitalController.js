const Hospital = require('../models/Hospital');
const Lab = require('../models/Lab');
const Referral = require('../models/Referral');
const Booking = require('../models/Booking');

// GET /api/hospitals
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .populate('doctors', 'name email phone')
      .populate('recommendedLabs', 'name trustScore location ratings');
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/hospitals/recommend
exports.recommendLab = async (req, res) => {
  try {
    const { labId } = req.body;
    
    // Find hospital for current user
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    if (!hospital.recommendedLabs.includes(labId)) {
      hospital.recommendedLabs.push(labId);
      await hospital.save();

      // Increment lab recommendation count
      const lab = await Lab.findById(labId);
      if (lab) {
        lab.hospitalRecommendations += 1;
        await lab.save();
      }
    }
    res.json({ message: 'Lab recommended successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/hospitals/remove-recommendation
exports.removeRecommendation = async (req, res) => {
  try {
    const { labId } = req.body;
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    hospital.recommendedLabs = hospital.recommendedLabs.filter(id => id.toString() !== labId);
    await hospital.save();
    res.json({ message: 'Recommendation removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/hospitals/refer
exports.referPatient = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const { patientName, patientPhone, patientEmail, labId, testName, urgency, notes, doctorId } = req.body;
    const referral = await Referral.create({
      doctorId: doctorId || req.user._id,
      patientName,
      patientPhone,
      patientEmail,
      labId,
      testName,
      urgency: urgency || 'routine',
      notes,
      hospitalId: hospital._id,
    });
    res.status(201).json(referral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/hospitals/update
exports.updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    Object.assign(hospital, req.body);
    await hospital.save();
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
