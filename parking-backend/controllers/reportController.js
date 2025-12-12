
const dayjs = require('dayjs');
const PaymentModel = require('../models/paymentModel');
const pool = require('../config/db');

const ReportController = {
  // Admin: GET /api/reports/daily?date=YYYY-MM-DD
  async daily(req, res) {
    try {
      const dateISO = req.query.date || dayjs().format('YYYY-MM-DD');
      const total = await PaymentModel.sumByDay(dateISO);
      const byLot = await PaymentModel.sumByDayPerLot(dateISO);
      res.json({ date: dateISO, total_earnings: Number(total), breakdown: byLot });
    } catch (err) {
      console.error('Daily report error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: GET /api/reports/daily-details?date=YYYY-MM-DD
  // Returns detailed booking information for the specified date
  async dailyDetails(req, res) {
    try {
      const dateISO = req.query.date || dayjs().format('YYYY-MM-DD');

      const { rows } = await pool.query(
        `SELECT 
          r.id as reservation_id,
          r.start_time,
          r.end_time,
          r.status,
          r.slot_number,
          u.name as user_name,
          u.email as user_email,
          u.phone_number,
          p.name as parking_lot,
          p.location,
          pay.amount,
          pay.method as payment_method,
          pay.transaction_code,
          pay.payment_time,
          pay.status as payment_status
        FROM reservations r
        JOIN users u ON u.id = r.user_id
        JOIN parking_lots p ON p.id = r.lot_id
        LEFT JOIN payments pay ON pay.reservation_id = r.id
        WHERE DATE(r.created_at) = $1::date
        ORDER BY r.created_at DESC`,
        [dateISO]
      );

      // Calculate summary statistics
      const totalBookings = rows.length;
      const paidBookings = rows.filter(r => r.payment_status === 'paid').length;
      const totalRevenue = rows
        .filter(r => r.payment_status === 'paid')
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);

      res.json({
        date: dateISO,
        summary: {
          total_bookings: totalBookings,
          paid_bookings: paidBookings,
          pending_bookings: totalBookings - paidBookings,
          total_revenue: totalRevenue
        },
        bookings: rows
      });
    } catch (err) {
      console.error('Daily details report error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = ReportController;
