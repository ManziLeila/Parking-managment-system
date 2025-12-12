
const dayjs = require('dayjs');
const ReservationModel = require('../models/reservationModel');

const ReservationController = {
  // Driver: create booking
  async create(req, res) {
    try {
      const { lot_id, slot_number, start_time, end_time } = req.body || {};
      if (!lot_id || !start_time || !end_time) {
        return res.status(400).json({ message: 'lot_id, start_time, end_time are required' });
      }
      // Basic validation: end after start
      if (new Date(end_time) <= new Date(start_time)) {
        return res.status(400).json({ message: 'end_time must be after start_time' });
      }

      const reservation = await ReservationModel.createWithDecrement({
        user_id: req.user.id,
        lot_id,
        slot_number,
        start_time,
        end_time
      });

      res.status(201).json({ message: 'Reserved', reservation });
    } catch (err) {
      if (String(err.message).includes('No available slots')) {
        return res.status(409).json({ message: 'No available slots at this lot' });
      }
      console.error('Create reservation error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Driver: my reservations
  async mine(req, res) {
    try {
      const items = await ReservationModel.findMy(req.user.id);
      res.json({ reservations: items });
    } catch (err) {
      console.error('My reservations error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: all reservations
  async all(req, res) {
    try {
      const items = await ReservationModel.findAll();
      res.json({ reservations: items });
    } catch (err) {
      console.error('All reservations error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Driver/Admin: cancel
  async cancel(req, res) {
    try {
      // Check if reservation exists and its current status
      const reservation = await ReservationModel.findById(req.params.id);
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      // Prevent cancellation if already paid
      if (reservation.status === 'paid' || reservation.status === 'completed') {
        return res.status(400).json({
          message: 'Cannot cancel a paid or completed reservation. Please contact support for refunds.'
        });
      }

      const updated = await ReservationModel.updateStatusAndAdjust(req.params.id, 'cancelled');
      res.json({ message: 'Cancelled', reservation: updated });
    } catch (err) {
      console.error('Cancel reservation error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: mark completed
  async complete(req, res) {
    try {
      const updated = await ReservationModel.updateStatusAndAdjust(req.params.id, 'completed');
      res.json({ message: 'Completed', reservation: updated });
    } catch (err) {
      console.error('Complete reservation error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = ReservationController;
