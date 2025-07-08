-- Add missing columns to pension_info table if they don't exist
ALTER TABLE pension_info 
ADD COLUMN IF NOT EXISTS phone_secondary TEXT,
ADD COLUMN IF NOT EXISTS amenities TEXT[],
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[],
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS company_id TEXT,
ADD COLUMN IF NOT EXISTS payment_methods TEXT[],
ADD COLUMN IF NOT EXISTS policies JSONB;
