-- Add usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_access(id) ON DELETE CASCADE,
  token_id UUID REFERENCES user_access(id) ON DELETE CASCADE,
  month_start DATE NOT NULL,
  request_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(token_id, month_start)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_token_month ON usage_tracking(token_id, month_start);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month_start);

-- Add plan_type column to user_access table
ALTER TABLE user_access ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) DEFAULT 'free';
ALTER TABLE user_access ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);
ALTER TABLE user_access ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);

-- Add index for plan_type
CREATE INDEX IF NOT EXISTS idx_user_access_plan_type ON user_access(plan_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for usage_tracking table
CREATE TRIGGER update_usage_tracking_updated_at 
    BEFORE UPDATE ON usage_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 