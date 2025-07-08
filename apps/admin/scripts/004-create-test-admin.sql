-- Vytvoření testovacího administrátora
-- Email: test@jesuitska.cz
-- Heslo: password123
INSERT INTO admin_users (email, password_hash, full_name, role, is_active) VALUES
('test@jesuitska.cz', '$2b$10$rQZ9QzKvQYnKxLvDx8aKxOK8WQx5YzKvQYnKxLvDx8aKxOK8WQx5Y', 'Test Admin', 'admin', true);
