-- ==============================================================================
-- Aurora - Migration V13: Seed Dedicated Customer Test Account
-- Email: test.customer@aurora.tn
-- Password: AuroraTest2026!
-- Role: ROLE_USER (Customer)
-- ==============================================================================

INSERT INTO users (id, email, password_hash, first_name, last_name, auth_provider, role, is_active)
VALUES (
    'c1a2b3c4-d5e6-4a7b-8c9d-0e1f2a3b4c99',
    'test.customer@aurora.tn',
    '$2a$10$Q7w0mYl6eE2HspGk3tL.QOa5vQ121Gv7nEvfT4k4E7C4Yq9O8rZ6e',
    'Test',
    'Customer',
    'LOCAL',
    'ROLE_USER',
    TRUE
)
ON CONFLICT (email) DO UPDATE 
SET role = 'ROLE_USER',
    is_active = TRUE;

-- Delete any existing cart items for this test customer to guarantee a clean empty cart
DELETE FROM cart_items 
WHERE cart_id IN (
    SELECT id FROM carts WHERE user_id IN (
        SELECT id FROM users WHERE email = 'test.customer@aurora.tn'
    )
);
