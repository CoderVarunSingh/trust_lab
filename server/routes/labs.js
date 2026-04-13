const express = require('express');
const router = express.Router();
const { getLabs, getLabById, updateLab, recalculateTrust, updateStaff, addStaffMember, removeStaffMember, uploadPhoto, deletePhoto } = require('../controllers/labController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.get('/', getLabs);
router.get('/:id', getLabById);
router.put('/:id', protect, roleCheck('lab'), updateLab);
router.post('/:id/recalculate-trust', protect, recalculateTrust);

// Staff management
router.put('/:id/staff', protect, roleCheck('lab'), updateStaff);
router.post('/:id/staff', protect, roleCheck('lab'), addStaffMember);
router.delete('/:id/staff/:staffIdx', protect, roleCheck('lab'), removeStaffMember);

// Photo management
router.post('/:id/photo', protect, roleCheck('lab'), upload.single('photo'), uploadPhoto);
router.patch('/:id/photo', protect, roleCheck('lab'), deletePhoto);

module.exports = router;
