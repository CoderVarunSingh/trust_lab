const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getLabBookings, updateBookingStatus, getBookingById, uploadReport } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.post('/', protect, roleCheck('patient'), createBooking);
router.get('/my', protect, getMyBookings);
router.get('/lab', protect, roleCheck('lab'), getLabBookings);
router.put('/:id/status', protect, roleCheck('lab'), updateBookingStatus);
router.post('/:id/upload-report', protect, roleCheck('lab'), upload.single('reportPDF'), uploadReport);
router.get('/:id', protect, getBookingById);

module.exports = router;
