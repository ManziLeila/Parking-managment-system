 
const pool = require('../config/db');

const PaymentModel = {
  async create({ reservation_id, amount, method, status, transaction_code }) {
    const { rows } = await pool.query(
      `INSERT INTO payments (reservation_id, amount, method, status, transaction_code)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [reservation_id, amount, method, status || 'pending', transaction_code || null]
    );
    return rows[0];
  },

  async markPaid(id) {
    const { rows } = await pool.query(
      `UPDATE payments SET status = 'paid', payment_time = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  },

  async findByReservation(reservation_id) {
    const { rows } = await pool.query(
      `SELECT * FROM payments WHERE reservation_id = $1 ORDER BY payment_time DESC`,
      [reservation_id]
    );
    return rows;
  },

  async sumByDay(dateISO) {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total
       FROM payments
       WHERE status='paid' AND DATE(payment_time) = $1::date`,
      [dateISO]
    );
    return rows[0]?.total || 0;
  },

  async sumByDayPerLot(dateISO) {
    const { rows } = await pool.query(
      `SELECT r.lot_id, p.name AS lot_name, COALESCE(SUM(pay.amount),0) AS total
       FROM payments pay
       JOIN reservations r ON r.id = pay.reservation_id
       JOIN parking_lots p ON p.id = r.lot_id
       WHERE pay.status='paid' AND DATE(pay.payment_time) = $1::date
       GROUP BY r.lot_id, p.name
       ORDER BY total DESC`,
      [dateISO]
    );
    return rows;
  }
};

module.exports = PaymentModel;
