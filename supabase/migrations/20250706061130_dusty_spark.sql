/*
  # User Access Management System

  1. New Tables
    - `user_access`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `access_token` (uuid, unique, not null)
      - `stripe_customer_id` (text, unique)
      - `status` (text, not null) - 'trialing', 'active', 'inactive'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_access` table
    - Add policies for service role access only (no public access)
    - Add indexes for performance on email, access_token, and stripe_customer_id

  3. Functions
    - Trigger to automatically update `updated_at` timestamp
*/

-- Create user_access table
CREATE TABLE IF NOT EXISTS user_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  access_token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  stripe_customer_id text UNIQUE,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('trialing', 'active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access only (webhooks and API endpoints)
CREATE POLICY "Service role can manage user access"
  ON user_access
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_access_email ON user_access(email);
CREATE INDEX IF NOT EXISTS idx_user_access_token ON user_access(access_token);
CREATE INDEX IF NOT EXISTS idx_user_access_stripe_customer ON user_access(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_access_status ON user_access(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_access_updated_at ON user_access;
CREATE TRIGGER update_user_access_updated_at
  BEFORE UPDATE ON user_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();