const express = require('express');
const router = express.Router();
const { getHospitals, recommendLab, removeRecommendation, referPatient, updateHospital } = require('../controllers/hospitalController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', getHospitals);
router.post('/recommend', protect, roleCheck('hospital'), recommendLab);
router.post('/remove-recommendation', protect, roleCheck('hospital'), removeRecommendation);
router.post('/refer', protect, roleCheck('hospital'), referPatient);
router.put('/update', protect, roleCheck('hospital'), updateHospital);

module.exports = router;
