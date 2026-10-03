-- ==============================================================================
-- Aurora Artisan Decor - Database Migration V5: Promotional Discounts & Special Offers
-- Ensures active promotional masks exist with attractive discount percentages
-- Categories: 1 = Abstract, 2 = Animals, 3 = People
-- ==============================================================================

-- 1. Ensure Artisanal Masks Exist and Have Active Promotional Discounts
INSERT INTO products (
    id, category_id, name, slug, short_description, detailed_description,
    wood_type, dimensions, weight_grams, price_eur, price_usd, discount_percentage,
    stock_quantity, is_featured, is_active, artisan_notes
) VALUES
(
    'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
    2,
    'Atlas Lion Totem Mask',
    'atlas-lion-totem-mask',
    'Fierce ceremonial mask embodying the ancestral spirit of the Barbary lion.',
    'Sculpted from aged Tunisian olive wood and smoked cedar. Features deep hand-carved mane textures and polished natural wax finish.',
    'Smoked Mediterranean Oak & Olive Wood',
    '44cm x 26cm x 12cm',
    2300,
    450.00,
    490.00,
    25,
    6,
    TRUE,
    TRUE,
    'Limited edition seasonal discount for collector connoisseurs.'
),
(
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    1,
    'Solstice Eclipse Mask',
    'solstice-eclipse-mask',
    'Contemporary abstract wooden face mask celebrating positive and negative space.',
    'A collector centerpiece designed for modern architectural interiors. Merges ancient Tunisian olive branch textures with asymmetrical contours.',
    'Tunisian Olive Wood & Dark Walnut Stain',
    '42cm x 30cm x 8cm',
    2100,
    420.00,
    455.00,
    20,
    5,
    TRUE,
    TRUE,
    'Finished with three coats of matte protective botanical varnish.'
),
(
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    3,
    'Nomad of the Grand Erg',
    'nomad-of-the-grand-erg',
    'Elongated Saharan ceremonial mask with intricate hand-incised geometric tribal patterns.',
    'Representing ancient desert caravans, this elongated mask features hand-incised triangle motifs symbolizing the dunes and constellations.',
    'Aged Saharan Cedar',
    '56cm x 18cm x 9cm',
    1850,
    295.00,
    320.00,
    15,
    8,
    TRUE,
    TRUE,
    'Hand-chiseled using traditional carbon steel gouges without electrical machinery.'
),
(
    '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
    2,
    'Fennec Spirit Desert Mask',
    'fennec-spirit-desert-mask',
    'Hand-chiseled Saharan fennec fox protective totem mask in aged olive wood.',
    'Honoring the cunning desert fox of the southern dunes, this mask features alert sculpted ears and delicate whisker engravings.',
    'Tunisian Olive Wood & Smoked Cedar',
    '42cm x 22cm x 10cm',
    1950,
    360.00,
    395.00,
    10,
    7,
    TRUE,
    TRUE,
    'Sculpted by Master Artisan Youssef in Tozeur, Tunisia.'
),
(
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    1,
    'Zenith Geometric Mask',
    'zenith-geometric-mask',
    'Minimalist curved facial silhouette with smooth satin finish and subtle brass inlay.',
    'Crafted from sustainable Tunisian Mediterranean Acacia. Featuring an uninterrupted satin surface and a hairline brushed brass seam down the vertical axis.',
    'Mediterranean Acacia & Brushed Brass',
    '50cm x 20cm x 10cm',
    1950,
    380.00,
    410.00,
    30,
    4,
    TRUE,
    TRUE,
    'Brass accents are hand-cast in the old medina of Tunis and flush-mounted into the wood.'
)
ON CONFLICT (id) DO UPDATE SET
    discount_percentage = EXCLUDED.discount_percentage,
    category_id = EXCLUDED.category_id,
    is_active = TRUE,
    price_eur = EXCLUDED.price_eur,
    price_usd = EXCLUDED.price_usd;

-- 2. Ensure Primary Images are Associated
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=85', 'Atlas Lion Totem Mask ceremonial view', TRUE, 1),
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85', 'Solstice Eclipse Mask contemporary abstract', TRUE, 1),
('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=85', 'Nomad of the Grand Erg elongated Saharan mask', TRUE, 1),
('7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85', 'Fennec Spirit Desert Mask front view', TRUE, 1),
('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85', 'Zenith Geometric Mask with brass inlay', TRUE, 1)
ON CONFLICT DO NOTHING;

-- 3. Also grant discount to any admin-created items if present
UPDATE products SET discount_percentage = 20 WHERE (name ILIKE '%Gaesha%' OR name ILIKE '%AFRICAN%') AND discount_percentage = 0;
