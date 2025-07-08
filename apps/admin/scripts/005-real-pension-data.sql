-- Aktualizace informací o penzionu s reálnými daty
-- Smazání stávajících testovacích dat
DELETE FROM invoices;
DELETE FROM reservations;
DELETE FROM rooms;
DELETE FROM room_types;
DELETE FROM guests;

-- Vytvoření tabulky pro informace o penzionu
CREATE TABLE IF NOT EXISTS pension_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50),
  phone2 VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  manager_name VARCHAR(255),
  ic VARCHAR(50),
  description TEXT,
  check_in_time VARCHAR(20),
  check_out_time VARCHAR(20),
  breakfast_price DECIMAL(5,2),
  rating DECIMAL(3,1),
  location_rating DECIMAL(3,1),
  opened_year INTEGER,
  languages TEXT[],
  payment_methods TEXT[],
  policies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vložení reálných informací o Pension Jesuitská
INSERT INTO pension_info (
  name, address, phone, phone2, email, website, manager_name, ic,
  description, check_in_time, check_out_time, breakfast_price,
  rating, location_rating, opened_year, languages, payment_methods, policies
) VALUES (
  'Pension Jesuitská',
  'Jesuitská 5/183, 669 02 Znojmo',
  '+420 603 830 130',
  '+420 515 224 496',
  'info@jesuitska.cz',
  'http://www.jesuitska.cz',
  'Ondřej Sabáček',
  '44969732',
  'Výjimečně hodnocené ubytovací zařízení v historickém centru Znojma s celkovým hodnocením 8,8/10. Nachází se v klidné lokalitě, vzdálené pouhých 5 minut chůze od kaňonu řeky Dyje a Národního parku Podyjí.',
  '13:00 - 19:00',
  '08:00 - 11:00',
  8.00,
  8.8,
  9.7,
  1994,
  ARRAY['Čeština', 'Němčina', 'Angličtina', 'Slovenština'],
  ARRAY['Hotovost'],
  ARRAY['Nekuřácký penzion', 'Párty/akce nejsou povoleny', 'Domácí mazlíčci na vyžádání']
);

-- Vložení reálných typů pokojů podle dokumentu
INSERT INTO room_types (name, description, capacity, price_per_night, amenities) VALUES
(
  'Dvoulůžkový pokoj',
  'Standardní dvoulůžkový pokoj s jedním dvojlůžkem, ideální pro páry',
  2,
  2200.00,
  ARRAY['Bezplatné Wi-Fi', 'TV s plochou obrazovkou', 'Vlastní koupelna', 'Kávovar/čajník', 'Fén', 'Ložní prádlo', 'Ručníky', 'Topení', 'Zásuvka u postele']
),
(
  'Dvoulůžkový pokoj se dvěma lůžky',
  'Dvoulůžkový pokoj se dvěma oddělenými lůžky, vhodný pro přátele nebo kolegy',
  2,
  2300.00,
  ARRAY['Bezplatné Wi-Fi', 'TV s plochou obrazovkou', 'Vlastní koupelna', 'Kávovar/čajník', 'Fén', 'Ložní prádlo', 'Ručníky', 'Topení', 'Šatní skříň']
),
(
  'Standardní dvoulůžkový pokoj',
  'Standardní dvoulůžkový pokoj s vylepšeným vybavením a komfortem',
  2,
  2500.00,
  ARRAY['Bezplatné Wi-Fi', 'TV s plochou obrazovkou', 'Vlastní koupelna', 'Kávovar/čajník', 'Lednice', 'Fén', 'Ložní prádlo', 'Ručníky', 'Topení', 'Posezení']
),
(
  'Deluxe Suite',
  'Luxusní apartmá s ložnicí (manželské lůžko + futon) a obývacím pokojem s rozkládací pohovkou',
  4,
  3800.00,
  ARRAY['Bezplatné Wi-Fi', 'TV s plochou obrazovkou', 'Vlastní koupelna', 'Kávovar/čajník', 'Lednice', 'Terasa s výhledem', 'Pohovka', 'Posezení', 'Fén', 'Topení', 'Šatní skříň']
);

-- Vložení konkrétních pokojů (odhadované čísla pokojů)
INSERT INTO rooms (room_number, room_type_id, floor, status) VALUES
-- Přízemí
('101', (SELECT id FROM room_types WHERE name = 'Dvoulůžkový pokoj' LIMIT 1), 1, 'available'),
('102', (SELECT id FROM room_types WHERE name = 'Dvoulůžkový pokoj se dvěma lůžky' LIMIT 1), 1, 'available'),
('103', (SELECT id FROM room_types WHERE name = 'Standardní dvoulůžkový pokoj' LIMIT 1), 1, 'available'),

-- První patro
('201', (SELECT id FROM room_types WHERE name = 'Dvoulůžkový pokoj' LIMIT 1), 2, 'available'),
('202', (SELECT id FROM room_types WHERE name = 'Dvoulůžkový pokoj se dvěma lůžky' LIMIT 1), 2, 'available'),
('203', (SELECT id FROM room_types WHERE name = 'Deluxe Suite' LIMIT 1), 2, 'available'),

-- Druhé patro
('301', (SELECT id FROM room_types WHERE name = 'Standardní dvoulůžkový pokoj' LIMIT 1), 3, 'available'),
('302', (SELECT id FROM room_types WHERE name = 'Deluxe Suite' LIMIT 1), 3, 'available');

-- Vytvoření tabulky pro služby a vybavení
CREATE TABLE IF NOT EXISTS pension_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(8,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vložení služeb podle dokumentu
INSERT INTO pension_services (category, service_name, description, is_free, price) VALUES
('Parkování', 'Bezplatné parkování', 'Bezplatné parkování pro hosty penzionu', true, 0),
('Internet', 'Bezplatné Wi-Fi', 'Vysokorychlostní internet ve všech pokojích a společných prostorách', true, 0),
('Stravování', 'Snídaně formou bufetu', 'Bohaté snídaně s džusy, čerstvým pečivem a sýry', false, 8.00),
('Ubytování', 'Rodinné pokoje', 'Pokoje vhodné pro rodiny s dětmi', true, 0),
('Ubytování', 'Nekuřácké pokoje', 'Všechny pokoje jsou nekuřácké', true, 0),
('Vybavení', 'Kávovar/čajník', 'Kávovar nebo čajník na všech pokojích', true, 0),
('Děti', 'Dětská postýlka', 'Dětská postýlka na vyžádání pro děti 0-3 roky', false, 10.00),
('Zvířata', 'Domácí mazlíčci', 'Domácí mazlíčci povoleni na vyžádání', false, 0),
('Cyklistika', 'Půjčení kol', 'Půjčení a úschova kol pro hosty', false, 0),
('Víno', 'Vinotéka', 'Vlastní malá vinotéka s místními víny', true, 0);

-- Vytvoření tabulky pro turistické atrakce
CREATE TABLE IF NOT EXISTS tourist_attractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  distance_km INTEGER,
  category VARCHAR(100),
  is_nearby BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vložení turistických atrakcí podle dokumentu
INSERT INTO tourist_attractions (name, description, distance_km, category, is_nearby) VALUES
('Znojemský hrad', 'Historický hrad v centru Znojma', 0, 'Historické památky', true),
('Znojemské podzemí', 'Rozsáhlý systém podzemních chodeb', 0, 'Historické památky', true),
('Vyhlídková radniční věž', 'Vyhlídková věž s panoramatickým výhledem na město', 0, 'Vyhlídky', true),
('Rotunda Panny Marie a sv. Kateřiny', 'Románská rotunda s unikátními freskami', 0, 'Historické památky', true),
('Kostel sv. Michala', 'Gotický kostel přímo u penzionu', 0, 'Historické památky', true),
('Kaňon řeky Dyje', 'Přírodní kaňon řeky Dyje', 0, 'Příroda', true),
('Národní park Podyjí', 'Národní park s unikátní přírodou', 0, 'Příroda', true),
('Zámek Vranov nad Dyjí', 'Barokní zámek na skále nad řekou Dyjí', 21, 'Zámky a hrady', false),
('Hrad Bítov', 'Středověký hrad na skalnatém ostrohu', 32, 'Zámky a hrady', false),
('Bazilika sv. Prokopa', 'Románsko-gotická bazilika v Třebíči', 48, 'Historické památky', false),
('Letiště Brno-Tuřany', 'Mezinárodní letiště', 66, 'Doprava', false);

-- Aktualizace administrátora
UPDATE admin_users 
SET full_name = 'Ondřej Sabáček', email = 'ondrej@jesuitska.cz' 
WHERE email = 'admin@jesuitska.cz';

-- Pokud administrátor neexistuje, vytvoříme ho
INSERT INTO admin_users (email, password_hash, full_name, role, is_active) 
SELECT 'ondrej@jesuitska.cz', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ondřej Sabáček', 'admin', true
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'ondrej@jesuitska.cz');
