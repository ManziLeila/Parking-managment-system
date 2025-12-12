 
const pool = require('../config/db');

const ParkingLotModel = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT id, name, location, total_slots, available_slots, created_at
       FROM parking_lots
       ORDER BY id DESC`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, name, location, total_slots, available_slots, created_at
       FROM parking_lots WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async create({ name, location, total_slots, available_slots }) {
    const { rows } = await pool.query(
      `INSERT INTO parking_lots (name, location, total_slots, available_slots)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, location, total_slots, available_slots, created_at`,
      [name, location, total_slots, available_slots ?? total_slots]
    );
    return rows[0];
  },

  async update(id, { name, location, total_slots, available_slots }) {
    const { rows } = await pool.query(
      `UPDATE parking_lots
       SET name = COALESCE($2, name),
           location = COALESCE($3, location),
           total_slots = COALESCE($4, total_slots),
           available_slots = COALESCE($5, available_slots)
       WHERE id = $1
       RETURNING id, name, location, total_slots, available_slots, created_at`,
      [id, name, location, total_slots, available_slots]
    );
    return rows[0];
  },

  async remove(id) {
    const { rowCount } = await pool.query(`DELETE FROM parking_lots WHERE id = $1`, [id]);
    return rowCount > 0;
  }
};

module.exports = ParkingLotModel;
