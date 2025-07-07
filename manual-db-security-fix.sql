-- MANUAL DATABASE SECURITY FIX
-- Run this script in your Supabase SQL Editor to enable security policies
-- Dashboard -> SQL Editor -> New Query -> Paste this script -> Run

-- Create user_access table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    access_token UUID NOT NULL DEFAULT gen_random_uuid(),
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_access_email ON public.user_access(email);
CREATE INDEX IF NOT EXISTS idx_user_access_token ON public.user_access(access_token);
CREATE INDEX IF NOT EXISTS idx_user_access_stripe_customer ON public.user_access(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_access_status ON public.user_access(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_user_access_updated_at ON public.user_access;
CREATE TRIGGER update_user_access_updated_at
    BEFORE UPDATE ON public.user_access
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage all user access" ON public.user_access;
DROP POLICY IF EXISTS "Users can view their own access" ON public.user_access;

-- Create RLS policies
CREATE POLICY "Service role can manage all user access" ON public.user_access
    FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view their own access" ON public.user_access
    FOR SELECT 
    USING (auth.jwt() ->> 'email' = email);

-- Grant necessary permissions
GRANT ALL ON public.user_access TO service_role;
GRANT SELECT ON public.user_access TO authenticated;
GRANT SELECT ON public.user_access TO anon;

-- Confirm RLS is enabled
SELECT 
    tablename,
    rowsecurity,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_access') as policy_count
FROM pg_tables 
WHERE tablename = 'user_access' AND schemaname = 'public';

-- Show active policies
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_access';

-- Success message
SELECT 'Database security policies successfully deployed!' as status; 