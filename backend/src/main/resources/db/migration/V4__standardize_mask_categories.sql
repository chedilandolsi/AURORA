-- ==============================================================================
-- Aurora Artisan Decor - Database Migration V4: Standardize Mask Categories
-- Domain Scope: Strictly wooden decorative masks across 3 categories:
-- 1. Abstract
-- 2. Animals
-- 3. People
-- ==============================================================================

-- 1. Update/Standardize Categories 1, 2, and 3
UPDATE categories 
SET name = 'Abstract', 
    slug = 'abstract', 
    description = 'Contemporary architectural and symbolic wooden mask forms celebrating abstract Mediterranean geometry.', 
    image_url = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80', 
    display_order = 1 
WHERE id = 1;

UPDATE categories 
SET name = 'Animals', 
    slug = 'animals', 
    description = 'Majestic wildlife totems and animal spirits hand-carved from seasoned olive and cedar wood.', 
    image_url = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80', 
    display_order = 2 
WHERE id = 2;

UPDATE categories 
SET name = 'People', 
    slug = 'people', 
    description = 'Expressive human portraits, ancestral Berber guardians, and ceremonial faces chiseled by master artisans.', 
    image_url = 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1000&q=80', 
    display_order = 3 
WHERE id = 3;

-- 2. Re-map Existing Products to Strictly Mask Domain & Categories
-- 'The Guardian of Matmata' -> People (id = 3)
UPDATE products 
SET category_id = 3 
WHERE id = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

-- 'Nomad of the Grand Erg' -> People (id = 3)
UPDATE products 
SET category_id = 3 
WHERE id = 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e';

-- 'Solstice Eclipse Sculpture' -> 'Solstice Eclipse Mask' (Abstract, id = 1)
UPDATE products 
SET name = 'Solstice Eclipse Mask',
    slug = 'solstice-eclipse-mask',
    category_id = 1,
    short_description = 'Contemporary abstract wooden mask celebrating Mediterranean light and shadow.'
WHERE id = 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f';

-- 'Zenith Monolith' -> 'Zenith Geometric Mask' (Abstract, id = 1)
UPDATE products 
SET name = 'Zenith Geometric Mask',
    slug = 'zenith-geometric-mask',
    category_id = 1,
    short_description = 'Minimalist geometric mask blending raw Tunisian olive grain with brushed brass.'
WHERE id = 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a';

-- 'Echoes of Dougga Wall Panel' -> 'Echoes of Dougga Mask' (Abstract, id = 1)
UPDATE products 
SET name = 'Echoes of Dougga Mask',
    slug = 'echoes-of-dougga-mask',
    category_id = 1,
    short_description = 'Bold architectural mask carving inspired by ancient Numidian stone temples.'
WHERE id = 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b';

-- 'The Carthage Oracle' -> 'Atlas Lion Totem Mask' (Animals, id = 2)
UPDATE products 
SET name = 'Atlas Lion Totem Mask',
    slug = 'atlas-lion-totem-mask',
    category_id = 2,
    short_description = 'Fierce ceremonial mask embodying the strength of the historic Barbary lion.'
WHERE id = 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c';

-- 3. Insert Additional Animals Category Mask
INSERT INTO products (
    id, category_id, name, slug, short_description, detailed_description,
    wood_type, dimensions, weight_grams, price_eur, price_usd, discount_percentage,
    stock_quantity, is_featured, is_active, artisan_notes
) VALUES (
    '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
    2,
    'Fennec Spirit Desert Mask',
    'fennec-spirit-desert-mask',
    'Hand-chiseled Saharan fennec fox protective totem mask in aged olive wood.',
    'Honoring the cunning desert fox of the southern Tunisian dunes, this mask features alert sculpted ears and delicate whisker engravings chiseled into seasoned Mediterranean olive wood. Finished with smoked cedar oil and natural beeswax.',
    'Tunisian Olive Wood & Smoked Cedar',
    '42cm x 22cm x 10cm',
    1950,
    360.00,
    395.00,
    0,
    6,
    TRUE,
    TRUE,
    'Sculpted by Master Artisan Youssef in Tozeur, Tunisia.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
VALUES ('7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85', 'Fennec Spirit Desert Mask - Primary View', TRUE, 1)
ON CONFLICT DO NOTHING;

-- 4. Delete Any Obsolete Categories not in the 3 Standardized Categories
DELETE FROM categories WHERE id NOT IN (1, 2, 3);
