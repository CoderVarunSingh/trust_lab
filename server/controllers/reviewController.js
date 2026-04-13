const Review = require('../models/Review');
const Lab = require('../models/Lab');
const { calculateTrustScore } = require('../utils/trustScore');

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { labId, rating, accuracyScore, comment } = req.body;

    const existingReview = await Review.findOne({ userId: req.user._id, labId });
    if (existingReview) return res.status(400).json({ message: 'You already reviewed this lab' });

    const review = await Review.create({
      userId: req.user._id,
      labId,
      rating,
      accuracyScore,
      comment,
    });

    // Recalculate trust score
    const reviews = await Review.find({ labId });
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const avgAccuracy = reviews.reduce((s, r) => s + r.accuracyScore, 0) / reviews.length;

    const lab = await Lab.findById(labId);
    const drNorm = Math.min(lab.doctorRecommendations / 10, 5);
    const hrNorm = Math.min(lab.hospitalRecommendations / 5, 5);

    lab.trustScore = calculateTrustScore({
      rating: avgRating,
      accuracy: avgAccuracy,
      doctorRec: drNorm,
      hospitalRec: hrNorm,
      consistency: lab.reportConsistency,
    });
    lab.ratings = Math.round(avgRating * 10) / 10;
    lab.totalReviews = reviews.length;
    await lab.save();

    const populated = await Review.findById(review._id).populate('userId', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/lab/:labId
exports.getLabReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ labId: req.params.labId })
      .populate('userId', 'name avatar email phone')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
