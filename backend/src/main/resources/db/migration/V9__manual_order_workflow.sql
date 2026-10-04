-- ==============================================================================
-- Aurora - Migration V9: Manual "Order Without Paying" workflow
-- Adds payment method tracking and admin review metadata to orders.
-- Order status values are stored as VARCHAR(50), so the new enum values
-- (PENDING_MANUAL_CONFIRMATION, CONFIRMED, REJECTED) need no schema change.
-- ==============================================================================

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'STRIPE',
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS review_note TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_payment_method_status ON orders(payment_method, status);
