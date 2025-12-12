 
const express = require('express');
const ReservationController = require('../controllers/reservationController');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

// Driver
router.post('/', authRequired, ReservationController.create);
router.get('/my', authRequired, ReservationController.mine);
router.put('/:id/cancel', authRequired, ReservationController.cancel);

// Admin
router.get('/', authRequired, requireRole('admin'), ReservationController.all);
router.put('/:id/complete', authRequired, requireRole('admin'), ReservationController.complete);

module.exports = router;
