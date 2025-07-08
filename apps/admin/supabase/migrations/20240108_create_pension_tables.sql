-- Create pension_info table
CREATE TABLE IF NOT EXISTS pension_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT NOT NULL,
  website TEXT,
  check_in_time TIME NOT NULL DEFAULT '14:00',
  check_out_time TIME NOT NULL DEFAULT '10:00',
  description TEXT,
  amenities TEXT[],
  languages_spoken TEXT[],
  owner_name TEXT,
  company_id TEXT,
  payment_methods TEXT[],
  policies JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT pension_info_single_row CHECK (id = 1)
);

-- Create additional_services table
CREATE TABLE IF NOT EXISTS additional_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CZK',
  age_restriction TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create nearby_attractions table
CREATE TABLE IF NOT EXISTS nearby_attractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  distance_km DECIMAL(5, 2),
  address TEXT,
  website TEXT,
  phone TEXT,
  opening_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reservation_services table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS reservation_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES additional_services(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(reservation_id, service_id)
);

-- Add RLS policies
ALTER TABLE pension_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE nearby_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_services ENABLE ROW LEVEL SECURITY;

-- Pension info policies (read-only for all, write for authenticated)
CREATE POLICY "Pension info viewable by all" ON pension_info
  FOR SELECT USING (true);

CREATE POLICY "Pension info editable by authenticated users" ON pension_info
  FOR ALL USING (auth.role() = 'authenticated');

-- Additional services policies
CREATE POLICY "Services viewable by all" ON additional_services
  FOR SELECT USING (true);

CREATE POLICY "Services editable by authenticated users" ON additional_services
  FOR ALL USING (auth.role() = 'authenticated');

-- Nearby attractions policies
CREATE POLICY "Attractions viewable by all" ON nearby_attractions
  FOR SELECT USING (true);

CREATE POLICY "Attractions editable by authenticated users" ON nearby_attractions
  FOR ALL USING (auth.role() = 'authenticated');

-- Reservation services policies
CREATE POLICY "Reservation services viewable by all" ON reservation_services
  FOR SELECT USING (true);

CREATE POLICY "Reservation services editable by authenticated users" ON reservation_services
  FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_pension_info_updated_at BEFORE UPDATE ON pension_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_additional_services_updated_at BEFORE UPDATE ON additional_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nearby_attractions_updated_at BEFORE UPDATE ON nearby_attractions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
