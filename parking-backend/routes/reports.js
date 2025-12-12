const express = require('express');
const ReportController = require('../controllers/reportController');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/daily', authRequired, requireRole('admin'), ReportController.daily);
router.get('/daily-details', authRequired, requireRole('admin'), ReportController.dailyDetails);

module.exports = router;

