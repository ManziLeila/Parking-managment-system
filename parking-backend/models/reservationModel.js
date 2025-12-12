
const pool = require('../config/db');

const ReservationModel = {
  async findMy(userId) {
    const { rows } = await pool.query(
      `SELECT r.*, p.name AS lot_name, p.location
       FROM reservations r
       JOIN parking_lots p ON p.id = r.lot_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async findAll() {
    const { rows } = await pool.query(
      `SELECT r.*, u.name AS user_name, p.name AS lot_name
       FROM reservations r
       JOIN users u ON u.id = r.user_id
       JOIN parking_lots p ON p.id = r.lot_id
       ORDER BY r.created_at DESC`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM reservations WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async createWithDecrement({ user_id, lot_id, slot_number, start_time, end_time }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // lock the lot row to avoid race conditions
      const lotRes = await client.query(
        `SELECT id, available_slots, total_slots FROM parking_lots WHERE id = $1 FOR UPDATE`,
        [lot_id]
      );
      const lot = lotRes.rows[0];
      if (!lot) throw new Error('Parking lot not found');
      if (lot.available_slots <= 0) throw new Error('No available slots');

      // decrement
      await client.query(
        `UPDATE parking_lots SET available_slots = available_slots - 1 WHERE id = $1`,
        [lot_id]
      );

      // create reservation
      const insertRes = await client.query(
        `INSERT INTO reservations (user_id, lot_id, slot_number, start_time, end_time, status)
         VALUES ($1,$2,$3,$4,$5,'booked')
         RETURNING *`,
        [user_id, lot_id, slot_number || null, start_time, end_time]
      );

      await client.query('COMMIT');
      return insertRes.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async updateStatusAndAdjust(id, nextStatus) {
    // Adjust available_slots only if moving to 'cancelled' from booked/active (not paid)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const rRes = await client.query(`SELECT * FROM reservations WHERE id = $1 FOR UPDATE`, [id]);
      const r = rRes.rows[0];
      if (!r) throw new Error('Reservation not found');

      // Only increment slots back if cancelling a booked/active reservation (not paid)
      if (nextStatus === 'cancelled' && ['booked', 'active'].includes(r.status)) {
        await client.query(
          `UPDATE parking_lots SET available_slots = available_slots + 1 WHERE id = $1`,
          [r.lot_id]
        );
      }

      const uRes = await client.query(
        `UPDATE reservations SET status = $2 WHERE id = $1 RETURNING *`,
        [id, nextStatus]
      );

      await client.query('COMMIT');
      return uRes.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};

module.exports = ReservationModel;
