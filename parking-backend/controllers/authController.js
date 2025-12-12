// controllers/authController.js
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const PasswordUtil = require('../utils/password');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

const AuthController = {
  // POST /api/auth/register
  async register(req, res) {
    try {
      const { name, firstName, lastName, email, password, phone, role } = req.body || {};
      const fullName = (name && name.trim()) || [firstName, lastName].filter(Boolean).join(' ').trim();
      if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'email, password, and name (or firstName + lastName) are required' });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) return res.status(409).json({ message: 'Email already registered' });

      const hashed = await PasswordUtil.hashPassword(password);
      const user = await UserModel.create({
        name: fullName,
        email,
        hashedPassword: hashed,
        role: role || 'driver',
        phone
      });

      const token = signToken(user);
      return res.status(201).json({ message: 'Registered', user, token });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

      const user = await UserModel.findByEmail(email);
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const match = await PasswordUtil.compare(password, user.password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });

      const token = signToken(user);
      return res.json({
        message: 'Logged in',
        user: { id: user.id, name: user.name, email: user.email, role: user.role, phone_number: user.phone_number },
        token
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // GET /api/auth/me
  async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ user });
    } catch (err) {
      console.error('Me error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // GET /api/auth/admin-only
  async adminOnly(req, res) {
    return res.json({ ok: true, message: 'Admin access confirmed' });
  }
};

module.exports = AuthController;
