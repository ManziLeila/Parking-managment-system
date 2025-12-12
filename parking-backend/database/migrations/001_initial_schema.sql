-- Smart Parking Management System - Initial Schema
-- Database: PostgreSQL 14+
-- Created: December 2025

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'driver' CHECK (role IN ('driver', 'admin')),
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create parking_lots table
CREATE TABLE IF NOT EXISTS parking_lots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    total_slots INTEGER NOT NULL CHECK (total_slots > 0),
    available_slots INTEGER NOT NULL CHECK (available_slots >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_available_slots CHECK (available_slots <= total_slots)
);

-- Create indexes for parking_lots table
CREATE INDEX IF NOT EXISTS idx_parking_lots_available ON parking_lots(available_slots);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lot_id INTEGER NOT NULL REFERENCES parking_lots(id) ON DELETE RESTRICT,
    slot_number VARCHAR(50),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'booked' CHECK (status IN ('booked', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_time_range CHECK (end_time > start_time)
);

-- Create indexes for reservations table
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_lot ON reservations(lot_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_time ON reservations(start_time, end_time);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    method VARCHAR(50) NOT NULL CHECK (method IN ('mobile_money', 'credit_card', 'cash')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    transaction_code VARCHAR(255) UNIQUE,
    payment_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_reservation ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_time ON payments(payment_time);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_code);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
END $$;
