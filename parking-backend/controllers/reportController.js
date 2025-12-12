 
const dayjs = require('dayjs');
const PaymentModel = require('../models/paymentModel');

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
  }
};

module.exports = ReportController;
