-- ReturnIt Supabase Migration Script
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_driver BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  driver_license TEXT,
  vehicle_info JSONB,
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  tracking_number TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('created', 'assigned', 'picked_up', 'dropped_off', 'completed', 'cancelled', 'refunded')) DEFAULT 'created',
  pickup_address JSONB NOT NULL,
  dropoff_address JSONB NOT NULL,
  package_details JSONB,
  total_amount NUMERIC(10, 2),
  driver_id INTEGER REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  dropped_off_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table (for retailer integration)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  return_policy_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retailer API Keys
CREATE TABLE IF NOT EXISTS retailer_api_keys (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit INTEGER DEFAULT 1000,
  current_usage INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Retailer Webhooks
CREATE TABLE IF NOT EXISTS retailer_webhooks (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  enabled_events JSONB DEFAULT '[]'::JSONB,
  timeout_seconds INTEGER DEFAULT 30,
  max_retries INTEGER DEFAULT 3,
  retry_backoff_seconds INTEGER DEFAULT 60,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_api_keys_company ON retailer_api_keys(company_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_company ON retailer_webhooks(company_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_webhooks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth setup)
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Orders can be read by the user who created them or the assigned driver
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid()::text = driver_id::text);

COMMENT ON TABLE users IS 'ReturnIt user accounts (customers, drivers, admins)';
COMMENT ON TABLE orders IS 'Return orders with full lifecycle tracking';
COMMENT ON TABLE companies IS 'Retailer companies using the platform';
COMMENT ON TABLE retailer_api_keys IS 'API keys for programmatic access';
COMMENT ON TABLE retailer_webhooks IS 'Webhook endpoints for event notifications';
