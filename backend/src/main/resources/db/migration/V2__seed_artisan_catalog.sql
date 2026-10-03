-- ==============================================================================
-- Aurora Artisan Decor - Database Seed Migration V2
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, display_order) VALUES
(1, 'Tribal Masks', 'tribal-masks', 'Ancestral Berber & Saharan ceremonial masks carved from century-old olive wood roots.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80', 1),
(2, 'Modern Minimalist', 'modern-minimalist', 'Sleek architectural wooden sculptures marrying Mediterranean raw grain with Nordic geometry.', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80', 2),
(3, 'Wall Sculptures', 'wall-sculptures', 'Large statement wall carvings celebrating North African geometry and natural wood organic edges.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80', 3),
(4, 'Ceremonial', 'ceremonial', 'Intricate protective masks with hand-carved motifs, charred wood finishes, and bronze details.', 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1000&q=80', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Artisan Products
INSERT INTO products (
    id, category_id, name, slug, short_description, detailed_description,
    wood_type, dimensions, weight_grams, price_eur, price_usd, discount_percentage,
    stock_quantity, is_featured, is_active, artisan_notes
) VALUES
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    1,
    'The Guardian of Matmata',
    'the-guardian-of-matmata',
    'Hand-carved ancestral Berber tribal mask with prominent eyebrow ridges and charred olive finish.',
    'Sculpted from a single block of 300-year-old salvaged olive wood from the olive groves of Sfax, Tunisia. The deep grain swirls and natural hollows are accentuated with organic beeswax and cold-pressed linseed oil. Symbolizes protection, endurance, and Mediterranean resilience.',
    'Century-Old Tunisian Olive Wood',
    '48cm x 24cm x 11cm',
    2400,
    340.00,
    370.00,
    0,
    8,
    TRUE,
    TRUE,
    'Carved by Master Artisan Mohamed Ali in Kairouan. Each contour follows the natural grain fissures.'
),
(
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    1,
    'Nomad of the Grand Erg',
    'nomad-of-the-grand-erg',
    'Elongated Saharan ceremonial mask with intricate hand-incised geometric tribal patterns.',
    'Representing the ancient caravans crossing the Tunisian desert dunes, this elongated mask features hand-incised triangle motifs symbolizing the dunes and stars. Sealed with smoked cedar smoke and natural plant pigments.',
    'Aged Saharan Cedar',
    '56cm x 18cm x 9cm',
    1850,
    295.00,
    320.00,
    10,
    5,
    TRUE,
    TRUE,
    'Hand-chiseled using traditional carbon steel gouges without modern electrical machinery.'
),
(
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    2,
    'Solstice Eclipse Sculpture',
    'solstice-eclipse-sculpture',
    'Contemporary abstract wooden face mask celebrating positive and negative space.',
    'A collector item designed for modern gallery walls in New York, Paris, and London. Merges ancient Tunisian olive branch textures with clean asymmetrical contours that capture changing ambient light throughout the day.',
    'Tunisian Olive Wood & Dark Walnut Stain',
    '42cm x 30cm x 8cm',
    2100,
    420.00,
    455.00,
    0,
    4,
    TRUE,
    TRUE,
    'Created in limited editions of 15 pieces. Finished with three coats of matte protective botanical varnish.'
),
(
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    2,
    'Zenith Monolith',
    'zenith-monolith',
    'Minimalist curved facial silhouette with smooth satin finish and subtle brass inlay.',
    'Crafted from sustainable Tunisian Mediterranean Acacia. Featuring an uninterrupted satin surface and a hairline brushed brass seam down the vertical axis representing the meridian sun over Carthage.',
    'Mediterranean Acacia & Brushed Brass',
    '50cm x 20cm x 10cm',
    1950,
    380.00,
    410.00,
    15,
    6,
    TRUE,
    TRUE,
    'Brass accents are hand-cast in the old medina of Tunis and flush-mounted into the wood.'
),
(
    'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    3,
    'Echoes of Dougga Wall Panel',
    'echoes-of-dougga-wall-panel',
    'Expansive sculptural wall mask relief inspired by Numidian architectural ruins.',
    'A dramatic centerpiece for high-ceiling living rooms, luxury hotel lobbies, or executive offices. Measures over 70 centimeters tall and displays raw live edges preserving the natural tree bark along the lateral borders.',
    'Wild Olive Root & Natural Bark',
    '72cm x 38cm x 14cm',
    4900,
    680.00,
    740.00,
    0,
    3,
    TRUE,
    TRUE,
    'Comes with reinforced steel French cleat mounting hardware rated for up to 25kg.'
),
(
    'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
    4,
    'The Carthage Oracle',
    'the-carthage-oracle',
    'Antique ceremonial mask adorned with natural indigo accents and hand-forged studs.',
    'Inspired by 5th-century Punic terracotta masks discovered near the Gulf of Tunis. This ceremonial wooden adaptation incorporates organic woad indigo stain into the incised chevrons and features weathered iron nail accents.',
    'Smoked Mediterranean Oak & Indigo',
    '44cm x 26cm x 12cm',
    2300,
    450.00,
    490.00,
    0,
    5,
    TRUE,
    TRUE,
    'Historically used in fertility and harvest rituals along the Mejerda river valley.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Product Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85', 'The Guardian of Matmata tribal wooden mask front view', TRUE, 1),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85', 'Olive wood grain detail of the Guardian mask', FALSE, 2),

('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=85', 'Nomad of the Grand Erg elongated Saharan mask', TRUE, 1),
('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85', 'Hand-carved triangle incisions detail', FALSE, 2),

('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85', 'Solstice Eclipse Sculpture contemporary abstract mask', TRUE, 1),
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85', 'Side angle highlighting curved contours', FALSE, 2),

('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85', 'Zenith Monolith minimalist acacia mask with brass inlay', TRUE, 1),

('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85', 'Echoes of Dougga large wall sculpture mask', TRUE, 1),

('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=85', 'The Carthage Oracle ceremonial mask with antique patina', TRUE, 1)
ON CONFLICT DO NOTHING;
