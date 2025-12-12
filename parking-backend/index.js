const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const authRoutes = require('./routes/auth');
const parkingRoutes = require('./routes/parking');
const reservationRoutes = require('./routes/reservations'); // <-- add
const paymentRoutes = require('./routes/payments');         // <-- add
const reportRoutes = require('./routes/reports');           // <-- add

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Smart Parking Backend is running...'));

app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/reservations', reservationRoutes); // <-- add
app.use('/api/payments', paymentRoutes);         // <-- add
app.use('/api/reports', reportRoutes);           // <-- add

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));
