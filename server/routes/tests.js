const express = require('express');
const router = express.Router();
const { getTests, compareTests, createTest, getPopularTests, getAllTests, updateTest, deleteTest } = require('../controllers/testController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', getTests);
router.get('/compare', compareTests);
router.get('/popular', getPopularTests);
router.get('/all', getAllTests);
router.post('/', protect, roleCheck('lab'), createTest);
router.put('/:id', protect, roleCheck('lab'), updateTest);
router.delete('/:id', protect, roleCheck('lab'), deleteTest);

module.exports = router;
