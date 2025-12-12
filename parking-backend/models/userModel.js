const pool = require('../config/db'); // <-- FIXED

const UserModel = {
  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    return rows[0];
  },
  async findById(id) {
    const { rows } = await pool.query('SELECT id, name, email, role, phone_number, created_at FROM users WHERE id = $1', [id]);
    return rows[0];
  },
  async create({ name, email, hashedPassword, role = 'driver', phone }) {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role, phone_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, phone_number, created_at`,
      [name, email, hashedPassword, role, phone || null]
    );
    return rows[0];
  }
};

module.exports = UserModel;
