-- Insert room types based on Pension Jesuitská information
INSERT INTO room_types (name, description, capacity, price_per_night, amenities) VALUES
('Dvoulůžkový pokoj', 'Standard double room with one double bed', 2, 80.00, ARRAY['Wi-Fi', 'TV', 'Private bathroom', 'Coffee/tea maker']),
('Dvoulůžkový se dvěma lůžky', 'Double room with two separate beds', 2, 85.00, ARRAY['Wi-Fi', 'TV', 'Private bathroom', 'Coffee/tea maker']),
('Standardní dvoulůžkový', 'Standard double room with enhanced amenities', 2, 90.00, ARRAY['Wi-Fi', 'TV', 'Private bathroom', 'Coffee/tea maker', 'Minibar']),
('Deluxe Suite', 'Luxury suite with separate living area', 4, 150.00, ARRAY['Wi-Fi', 'TV', 'Private bathroom', 'Coffee/tea maker', 'Minibar', 'Sofa bed', 'Terrace']);

-- Insert sample rooms
INSERT INTO rooms (room_number, room_type_id, floor) 
SELECT 
  '10' || generate_series(1, 3),
  (SELECT id FROM room_types WHERE name = 'Dvoulůžkový pokoj' LIMIT 1),
  1;

INSERT INTO rooms (room_number, room_type_id, floor) 
SELECT 
  '20' || generate_series(1, 2),
  (SELECT id FROM room_types WHERE name = 'Deluxe Suite' LIMIT 1),
  2;

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
('admin@jesuitska.cz', '$2b$10$rQZ9QzKvQYnKxLvDx8aKxOK8WQx5YzKvQYnKxLvDx8aKxOK8WQx5Y', 'Jana Sabáčková', 'admin');
