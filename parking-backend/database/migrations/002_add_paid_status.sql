-- Migration: Add 'paid' status to reservations
-- This allows reservations to be marked as 'paid' after payment is completed

-- Drop the old constraint
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

-- Add the new constraint with 'paid' status
ALTER TABLE reservations 
ADD CONSTRAINT reservations_status_check 
CHECK (status IN ('booked', 'active', 'paid', 'completed', 'cancelled'));

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Added paid status to reservations table successfully!';
END $$;
