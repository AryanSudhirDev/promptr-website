-- Create user_access table with proper security
CREATE TABLE IF NOT EXISTS public.user_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    access_token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
    stripe_customer_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_access_email ON public.user_access(email);
CREATE INDEX IF NOT EXISTS idx_user_access_token ON public.user_access(access_token);
CREATE INDEX IF NOT EXISTS idx_user_access_stripe_id ON public.user_access(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_access_status ON public.user_access(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_access_updated_at 
    BEFORE UPDATE ON public.user_access 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security

-- Service role can do everything (for Edge Functions)
CREATE POLICY "Service role can manage all user_access" ON public.user_access
    FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can only see their own records
CREATE POLICY "Users can view their own access records" ON public.user_access
    FOR SELECT USING (auth.email() = email);

-- No direct user inserts/updates (only through Edge Functions)
CREATE POLICY "No direct user modifications" ON public.user_access
    FOR INSERT WITH CHECK (false);

CREATE POLICY "No direct user updates" ON public.user_access
    FOR UPDATE USING (false);

CREATE POLICY "No direct user deletes" ON public.user_access
    FOR DELETE USING (false);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.user_access TO anon, authenticated;
GRANT ALL ON public.user_access TO service_role; 