-- Kontrola aktuálního stavu pokojů v databázi Supabase

-- Zobrazit všechny typy pokojů
SELECT * FROM room_types;

-- Zobrazit všechny pokoje
SELECT r.*, rt.name as room_type_name 
FROM rooms r
LEFT JOIN room_types rt ON r.room_type_id = rt.id
ORDER BY r.room_number;

-- Spočítat pokoje podle typu
SELECT rt.name as room_type, COUNT(r.id) as count
FROM room_types rt
LEFT JOIN rooms r ON rt.id = r.room_type_id
GROUP BY rt.name;

-- Celkový počet pokojů
SELECT COUNT(*) as total_rooms FROM rooms;
