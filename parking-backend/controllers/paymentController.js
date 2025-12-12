
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const PaymentModel = require('../models/paymentModel');
const ReservationModel = require('../models/reservationModel');

const PaymentController = {
  // Simulate a card or record cash payment
  // POST /api/payments
  // { reservation_id, amount, method: 'card'|'cash' }
  async create(req, res) {
    try {
      const { reservation_id, amount, method } = req.body || {};
      if (!reservation_id || !amount || !method) {
        return res.status(400).json({ message: 'reservation_id, amount, method required' });
      }
      if (!['card', 'cash'].includes(method)) {
        return res.status(400).json({ message: 'method must be card or cash' });
      }

      // basic reservation check
      const r = await ReservationModel.findById(reservation_id);
      if (!r) return res.status(404).json({ message: 'Reservation not found' });

      // Simulate success (in real life, call Stripe first)
      const txCode = uuidv4();
      const payment = await PaymentModel.create({
        reservation_id,
        amount,
        method,
        status: 'paid',
        transaction_code: txCode
      });

      // Update reservation status to 'paid' to prevent cancellation
      await ReservationModel.updateStatusAndAdjust(reservation_id, 'paid');

      // Generate QR (data URL) containing reservation + tx
      const qrPayload = JSON.stringify({
        type: 'PARKING_RECEIPT',
        reservation_id,
        transaction_code: txCode,
        method,
        amount
      });
      const qrDataURL = await QRCode.toDataURL(qrPayload);

      return res.status(201).json({
        message: 'Payment recorded',
        payment,
        receipt: { qr: qrDataURL, transaction_code: txCode }
      });
    } catch (err) {
      console.error('Create payment error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // GET /api/payments/by-reservation/:reservation_id
  async byReservation(req, res) {
    try {
      const items = await PaymentModel.findByReservation(req.params.reservation_id);
      res.json({ payments: items });
    } catch (err) {
      console.error('Payments by reservation error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = PaymentController;
