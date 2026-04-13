const express = require('express');
const router = express.Router();
const { patientDashboard, labDashboard, doctorDashboard, hospitalDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/patient', protect, patientDashboard);
router.get('/lab', protect, labDashboard);
router.get('/doctor', protect, doctorDashboard);
router.get('/hospital', protect, hospitalDashboard);

module.exports = router;
