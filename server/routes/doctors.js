const express = require('express');
const router = express.Router();
const { recommendLab, referPatient, getMyReferrals, updateReferral } = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/recommend', protect, roleCheck('doctor'), recommendLab);
router.post('/refer', protect, roleCheck('doctor'), referPatient);
router.get('/referrals', protect, roleCheck('doctor'), getMyReferrals);
router.put('/referrals/:id', protect, roleCheck('doctor'), updateReferral);

module.exports = router;
