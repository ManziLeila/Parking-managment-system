 
const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Any authenticated user can pay for their reservation;
// you could add checks to ensure the reservation belongs to them.
router.post('/', authRequired, PaymentController.create);
router.get('/by-reservation/:reservation_id', authRequired, PaymentController.byReservation);

module.exports = router;
