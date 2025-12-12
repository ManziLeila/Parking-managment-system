// routes/auth.js
const express = require('express');
const AuthController = require('../controllers/authController');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/register', AuthController.register);                 // must be a function
router.post('/login', AuthController.login);                       // must be a function
router.get('/me', authRequired, AuthController.me);
router.get('/admin-only', authRequired, requireRole('admin'), AuthController.adminOnly);

module.exports = router;
