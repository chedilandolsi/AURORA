-- ==============================================================================
-- Aurora - Migration V11: Strict Order Lifecycle FSM, DHL Tracking & AI Simulation Quota
-- ==============================================================================

-- 1. Extend orders table with tracking and delivery timestamp metadata
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS carrier VARCHAR(50) DEFAULT 'DHL Express',
    ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- 2. Migrate existing historical orders to strict FSM statuses
UPDATE orders
SET status = 'PENDING_CONFIRMATION'
WHERE status IN ('PENDING_MANUAL_CONFIRMATION', 'PAID');

UPDATE orders
SET status = 'ON_THE_WAY'
WHERE status = 'SHIPPED';

-- Set sample tracking numbers for historical shipped/confirmed orders
UPDATE orders
SET tracking_number = 'DHL-TN-' || SUBSTRING(order_number FROM 5),
    carrier = 'DHL Express',
    shipped_at = CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE status = 'ON_THE_WAY' AND tracking_number IS NULL;

-- 3. Create AI simulations table for virtual wall preview and monthly quota enforcement (max 3/month)
CREATE TABLE IF NOT EXISTS ai_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    wall_image_url TEXT NOT NULL,
    result_image_url TEXT NOT NULL,
    year_month VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_simulations_user_month ON ai_simulations(user_id, year_month);
