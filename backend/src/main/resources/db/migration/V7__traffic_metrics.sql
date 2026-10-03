-- ==============================================================================
-- Aurora Artisan Decor - Database Migration V7: Traffic & Visitor Metrics
-- Tracks store visits, sessions, and conversion analytics
-- ==============================================================================

CREATE TABLE IF NOT EXISTS traffic_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_ip_hash VARCHAR(64),
    user_agent VARCHAR(255),
    page_url VARCHAR(255),
    referrer VARCHAR(255),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_traffic_created_at ON traffic_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_traffic_user ON traffic_visits(user_id);
