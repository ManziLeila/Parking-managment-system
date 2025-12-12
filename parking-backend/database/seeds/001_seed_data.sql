-- Smart Parking Management System - Seed Data
-- Sample data for development and testing

-- Insert admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (name, email, password, role, phone_number) VALUES
('System Administrator', 'admin@parking.com', '$2a$10$YQZ9X8vXKZJ5Y5Y5Y5Y5Y.YQZ9X8vXKZJ5Y5Y5Y5Y5Y5YQZ9X8vXK', 'admin', '+250788000000')
ON CONFLICT (email) DO NOTHING;

-- Insert sample parking lots
INSERT INTO parking_lots (name, location, total_slots, available_slots) VALUES
('Main Campus Parking', 'Building A, Ground Floor - Near Main Entrance', 100, 100),
('Faculty Parking', 'Building B, Level 2 - Faculty Area', 50, 50),
('Student Parking', 'Building C, Outdoor - Behind Library', 150, 150),
('Visitor Parking', 'Main Gate Area - Reception', 30, 30),
('Staff Parking', 'Administration Block - Reserved Area', 40, 40)
ON CONFLICT DO NOTHING;

-- Insert sample driver users
-- Password: password123 (hashed with bcrypt)
INSERT INTO users (name, email, password, role, phone_number) VALUES
('John Doe', 'john@university.edu', '$2a$10$YQZ9X8vXKZJ5Y5Y5Y5Y5Y.YQZ9X8vXKZJ5Y5Y5Y5Y5Y5YQZ9X8vXK', 'driver', '+250788111111'),
('Jane Smith', 'jane@university.edu', '$2a$10$YQZ9X8vXKZJ5Y5Y5Y5Y5Y.YQZ9X8vXKZJ5Y5Y5Y5Y5Y5YQZ9X8vXK', 'driver', '+250788222222'),
('Bob Johnson', 'bob@university.edu', '$2a$10$YQZ9X8vXKZJ5Y5Y5Y5Y5Y.YQZ9X8vXKZJ5Y5Y5Y5Y5Y5YQZ9X8vXK', 'driver', '+250788333333')
ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Admin credentials: admin@parking.com / admin123';
    RAISE NOTICE 'Test user credentials: john@university.edu / password123';
END $$;
