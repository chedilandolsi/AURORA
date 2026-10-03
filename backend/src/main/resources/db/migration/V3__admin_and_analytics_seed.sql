-- ==============================================================================
-- Aurora Artisan Decor - Migration V3: Admin User & Analytics Historical Orders
-- ==============================================================================

-- 1. Insert Default Admin User (Password: AdminAurora2026!)
INSERT INTO users (id, email, password_hash, first_name, last_name, auth_provider, role, is_active)
VALUES (
    'e0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c',
    'admin@aurora.tn',
    '$2a$10$QdjDC0qHd39SSpgjEFo7LeN9jorHBMrDgx7DRHT9Vgn38Qx42GNSS',
    'Amine',
    'Ben Salem (Atelier Director)',
    'LOCAL',
    'ROLE_ADMIN',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Historical Orders for Analytics Engine (Daily, Weekly, Monthly, Yearly Trends)
INSERT INTO orders (
    id, order_number, status, payment_status, currency, subtotal_amount, shipping_amount, total_amount,
    customer_email, customer_name, shipping_address_line1, shipping_city, shipping_country, shipping_postal_code, created_at
) VALUES
-- Today
('11111111-1111-1111-1111-111111111111', 'AUR-202610-1001', 'PAID', 'PAID', 'EUR', 340.00, 0.00, 340.00, 'sophie.martin@paris.fr', 'Sophie Martin', '14 Rue de Rivoli', 'Paris', 'France', '75001', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('22222222-2222-2222-2222-222222222222', 'AUR-202610-1002', 'PAID', 'PAID', 'USD', 410.00, 0.00, 410.00, 'david.miller@nycdesign.com', 'David Miller', '452 Broadway, Soho', 'New York', 'United States', '10013', CURRENT_TIMESTAMP - INTERVAL '5 hours'),

-- Yesterday
('33333333-3333-3333-3333-333333333333', 'AUR-202610-1003', 'PAID', 'PAID', 'EUR', 680.00, 0.00, 680.00, 'marcus.weber@berlin.de', 'Marcus Weber', 'Friedrichstrasse 44', 'Berlin', 'Germany', '10117', CURRENT_TIMESTAMP - INTERVAL '1 day'),

-- This Week
('44444444-4444-4444-4444-444444444444', 'AUR-202610-1004', 'PAID', 'PAID', 'EUR', 420.00, 0.00, 420.00, 'giulia.rossi@milano.it', 'Giulia Rossi', 'Via Montenapoleone 8', 'Milano', 'Italy', '20121', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('55555555-5555-5555-5555-555555555555', 'AUR-202610-1005', 'PAID', 'PAID', 'USD', 740.00, 0.00, 740.00, 'elena.rostova@sf-loft.com', 'Elena Rostova', '888 Mission St', 'San Francisco', 'United States', '94103', CURRENT_TIMESTAMP - INTERVAL '5 days'),

-- This Month
('66666666-6666-6666-6666-666666666666', 'AUR-202610-1006', 'PAID', 'PAID', 'EUR', 340.00, 0.00, 340.00, 'arthur.clarke@london.co.uk', 'Arthur Clarke', '22 Kensington High St', 'London', 'United Kingdom', 'W8 4PT', CURRENT_TIMESTAMP - INTERVAL '12 days'),
('77777777-7777-7777-7777-777777777777', 'AUR-202610-1007', 'PAID', 'PAID', 'USD', 295.00, 0.00, 295.00, 'charlotte.king@austin.io', 'Charlotte King', '300 Congress Ave', 'Austin', 'United States', '78701', CURRENT_TIMESTAMP - INTERVAL '20 days'),

-- Earlier This Year
('88888888-8888-8888-8888-888888888888', 'AUR-202610-1008', 'PAID', 'PAID', 'EUR', 450.00, 0.00, 450.00, 'hugo.bernard@geneva.ch', 'Hugo Bernard', 'Rue du Rhône 12', 'Geneva', 'Switzerland', '1204', CURRENT_TIMESTAMP - INTERVAL '45 days'),
('99999999-9999-9999-9999-999999999999', 'AUR-202610-1009', 'PAID', 'PAID', 'USD', 680.00, 0.00, 680.00, 'lucas.morales@miami-art.com', 'Lucas Morales', '1200 Brickell Ave', 'Miami', 'United States', '33131', CURRENT_TIMESTAMP - INTERVAL '75 days')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Historical Order Items for Analytics Top Products
INSERT INTO order_items (order_id, product_id, product_name, product_wood_type, unit_price, quantity, total_price) VALUES
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'The Guardian of Matmata', 'Century-Old Tunisian Olive Wood', 340.00, 1, 340.00),
('22222222-2222-2222-2222-222222222222', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Zenith Monolith', 'Mediterranean Acacia & Brushed Brass', 410.00, 1, 410.00),
('33333333-3333-3333-3333-333333333333', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Echoes of Dougga Wall Panel', 'Wild Olive Root & Natural Bark', 680.00, 1, 680.00),
('44444444-4444-4444-4444-444444444444', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Solstice Eclipse Sculpture', 'Tunisian Olive Wood & Dark Walnut Stain', 420.00, 1, 420.00),
('55555555-5555-5555-5555-555555555555', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Echoes of Dougga Wall Panel', 'Wild Olive Root & Natural Bark', 740.00, 1, 740.00),
('66666666-6666-6666-6666-666666666666', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'The Guardian of Matmata', 'Century-Old Tunisian Olive Wood', 340.00, 1, 340.00),
('77777777-7777-7777-7777-777777777777', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Nomad of the Grand Erg', 'Aged Saharan Cedar', 295.00, 1, 295.00),
('88888888-8888-8888-8888-888888888888', 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'The Carthage Oracle', 'Smoked Mediterranean Oak & Indigo', 450.00, 1, 450.00),
('99999999-9999-9999-9999-999999999999', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Echoes of Dougga Wall Panel', 'Wild Olive Root & Natural Bark', 680.00, 1, 680.00)
ON CONFLICT DO NOTHING;
