-- Smazat stávajícího administrátora
DELETE FROM admin_users WHERE email = 'admin@jesuitska.cz';

-- Přidat nového administrátora s správně zahashovaným heslem
-- Heslo: admin123
INSERT INTO admin_users (email, password_hash, full_name, role, is_active) VALUES
('admin@jesuitska.cz', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jana Sabáčková', 'admin', true);
