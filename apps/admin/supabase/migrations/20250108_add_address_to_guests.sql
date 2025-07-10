-- Add address columns to guests table
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Add comment on columns
COMMENT ON COLUMN guests.address IS 'Street address of the guest';
COMMENT ON COLUMN guests.city IS 'City where the guest resides';
COMMENT ON COLUMN guests.postal_code IS 'Postal code of the guest address';
COMMENT ON COLUMN guests.country IS 'Country of the guest address';
