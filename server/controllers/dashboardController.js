const Booking = require('../models/Booking');
const Lab = require('../models/Lab');
const Test = require('../models/Test');
const Review = require('../models/Review');
const Hospital = require('../models/Hospital');
const Referral = require('../models/Referral');

// GET /api/dashboard/patient
exports.patientDashboard = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('labId', 'name location trustScore phone')
      .populate('testId', 'testName price reportTime')
      .sort({ createdAt: -1 });

    const stats = {
      totalBookings: bookings.length,
      activeBookings: bookings.filter(b => !['delivered', 'report_ready', 'rejected'].includes(b.status)).length,
      completedBookings: bookings.filter(b => b.status === 'delivered').length,
      totalSpent: bookings.reduce((s, b) => s + (b.totalAmount || 0), 0),
    };

    res.json({ stats, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/lab
exports.labDashboard = async (req, res) => {
  try {
    let lab = await Lab.findOne({ userId: req.user._id });
    if (!lab) {
      // Auto-initialize missing lab profile gracefully
      lab = await Lab.create({
        userId: req.user._id,
        name: req.user.name || 'New Diagnostic Lab',
        phone: req.user.phone || '',
        email: req.user.email || '',
        location: { city: req.user.city || 'Unknown', address: '', area: '', coordinates: { lat: 0, lng: 0 } },
        trustScore: 85,
        ratings: 0
      });
    }

    const bookings = await Booking.find({ labId: lab._id })
      .populate('userId', 'name email phone')
      .populate('testId', 'testName price')
      .sort({ createdAt: -1 });

    const reviews = await Review.find({ labId: lab._id })
      .populate('userId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    const tests = await Test.find({ labId: lab._id }).sort({ testName: 1 });

    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'booked').length,
      inProgressBookings: bookings.filter(b => ['confirmed', 'sample_collected', 'testing'].includes(b.status)).length,
      completedBookings: bookings.filter(b => ['report_ready', 'delivered'].includes(b.status)).length,
      rejectedBookings: bookings.filter(b => b.status === 'rejected').length,
      totalRevenue: bookings.filter(b => b.status !== 'rejected').reduce((s, b) => s + (b.totalAmount || 0), 0),
      trustScore: lab.trustScore,
      avgRating: lab.ratings,
      totalReviews: reviews.length,
      totalTests: tests.length,
      totalStaff: lab.staff?.length || 0,
    };

    // Unique patients
    const patientMap = {};
    bookings.forEach(b => {
      if (b.userId) patientMap[b.userId._id] = { 
        name: b.userId.name, email: b.userId.email, phone: b.userId.phone,
        bookings: (patientMap[b.userId._id]?.bookings || 0) + 1 
      };
    });
    const patients = Object.values(patientMap);

    res.json({ stats, bookings, lab, reviews, tests, patients, staff: lab.staff || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/doctor
exports.doctorDashboard = async (req, res) => {
  try {
    const labs = await Lab.find({}).sort({ trustScore: -1 });
    const referrals = await Referral.find({ doctorId: req.user._id })
      .populate('labId', 'name trustScore location')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    // Find hospital this doctor belongs to
    const hospital = await Hospital.findOne({ doctors: req.user._id }).populate('recommendedLabs', 'name trustScore location');

    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      completedReferrals: referrals.filter(r => r.status === 'completed').length,
      totalLabs: labs.length,
      hospitalName: hospital?.name || 'Independent',
    };

    res.json({ stats, labs, referrals, hospital });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/hospital
exports.hospitalDashboard = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id })
      .populate('doctors', 'name email phone')
      .populate('recommendedLabs', 'name trustScore location ratings totalReviews');

    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const labs = await Lab.find({}).sort({ trustScore: -1 });
    
    // Get all referrals from doctors in this hospital
    const doctorIds = hospital.doctors.map(d => d._id);
    const referrals = await Referral.find({ doctorId: { $in: doctorIds } })
      .populate('doctorId', 'name')
      .populate('labId', 'name trustScore')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    // Get bookings to recommended labs
    const recLabIds = hospital.recommendedLabs.map(l => l._id);
    const bookingsToRecLabs = await Booking.find({ labId: { $in: recLabIds } })
      .populate('userId', 'name phone')
      .populate('labId', 'name')
      .populate('testId', 'testName')
      .sort({ createdAt: -1 })
      .limit(50);

    // Report notifications: bookings to recommended labs where report is ready
    const reportNotifications = bookingsToRecLabs.filter(b => ['report_ready', 'delivered'].includes(b.status));

    const stats = {
      totalDoctors: hospital.doctors.length,
      recommendedLabsCount: hospital.recommendedLabs.length,
      totalReferrals: referrals.length,
      reportsReady: reportNotifications.length,
      city: hospital.city,
    };

    res.json({ stats, hospital, labs, referrals, reportNotifications, bookingsToRecLabs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
