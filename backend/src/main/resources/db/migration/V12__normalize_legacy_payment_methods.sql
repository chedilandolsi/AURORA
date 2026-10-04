-- ==============================================================================
-- Aurora - Migration V12: Normalize Legacy Payment Methods & Populate Strict Lifecycle Records
-- ==============================================================================

-- 1. Normalize any historical 'MANUAL' payment methods to 'STRIPE'
UPDATE orders
SET payment_method = 'STRIPE'
WHERE payment_method = 'MANUAL';

-- 2. Ensure all test tracking numbers follow standard format
UPDATE orders
SET carrier = 'DHL Express Worldwide'
WHERE carrier IS NULL;
