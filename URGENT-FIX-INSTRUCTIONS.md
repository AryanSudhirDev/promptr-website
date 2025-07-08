# 🚨 URGENT FIXES NEEDED - CRITICAL SECURITY VULNERABILITIES

## ⚠️ IMMEDIATE ACTIONS REQUIRED (15 minutes)

Your system has **CRITICAL SECURITY VULNERABILITIES** that must be fixed NOW:

### 1. 🔥 DATABASE IS WIDE OPEN (CRITICAL - 5 minutes)

**Problem**: Database has no security policies - anyone can access all user data.

**Fix**: Go to [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/gmfmcdvdfdltzgxvqtah/sql) and run this:

```sql
-- COPY AND PASTE THIS ENTIRE BLOCK INTO SUPABASE SQL EDITOR

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

-- Confirm success
SELECT 'Database security policies successfully deployed!' as status;
```

### 2. 🔑 MISSING ENVIRONMENT VARIABLES (CRITICAL - 5 minutes)

**Problem**: Edge Functions have no environment variables set.

**Fix**: Go to [Supabase Edge Functions Settings](https://supabase.com/dashboard/project/gmfmcdvdfdltzgxvqtah/settings/functions) and add:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret  
SUPABASE_URL=https://gmfmcdvdfdltzgxvqtah.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SITE_URL=https://your-production-domain.com
ENVIRONMENT=production
```

### 3. 🔄 REDEPLOY FUNCTIONS (CRITICAL - 5 minutes)

**Problem**: Functions need to be redeployed with environment variables.

**Fix**: Either:
- **Option A**: Use Supabase Dashboard → Edge Functions → Deploy each function
- **Option B**: Install Supabase CLI and run `supabase functions deploy`

---

## 🐛 SPECIFIC BUGS FOUND IN CODE

### Bug 1: Access Token Generation Logic
**File**: `supabase/functions/stripe-webhooks/index.ts` (Lines 118-125)

**Problem**: The recent fix ensures access tokens are generated for existing users, but there's still a potential issue.

**Current Code** (Lines 118-125):
```typescript
// If user doesn't have an access token, generate one
if (!existingUser.access_token) {
  updateData.access_token = crypto.randomUUID();
  console.log('Generating missing access token for existing user:', email);
}
```

**Issue**: Should also handle `null` and empty string cases more robustly.

### Bug 2: Environment Variables Missing
**Files**: All Edge Functions

**Problem**: Functions expect environment variables that aren't set:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`

**Effect**: Functions will fail with "undefined" errors.

### Bug 3: Database Access Issues
**File**: `supabase/functions/get-user-token/index.ts`

**Problem**: Function works but will fail once RLS is enabled without proper service role key.

**Current Status**: Function uses service role key but environment variable is missing.

---

## 🎯 VERIFICATION STEPS

After fixing above:

1. **Test Database**: Run this in SQL Editor:
```sql
SELECT COUNT(*) as user_count FROM public.user_access;
```

2. **Test Function**: Use browser to visit:
```
https://gmfmcdvdfdltzgxvqtah.supabase.co/functions/v1/get-user-token?debug=1
```

3. **Test Token Generation**: 
```bash
curl -X POST https://gmfmcdvdfdltzgxvqtah.supabase.co/functions/v1/get-user-token \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

4. **Test Checkout Flow**:
```bash
curl -X POST https://gmfmcdvdfdltzgxvqtah.supabase.co/functions/v1/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 🚨 CURRENT RISK LEVEL: CRITICAL

- **Database**: No security - anyone can access user data
- **Functions**: Failing due to missing environment variables  
- **Webhooks**: May not be generating access tokens properly
- **Production**: Not ready for deployment

**Time to fix**: 15 minutes if you follow steps above exactly.

**Priority**: 
1. Fix database security FIRST
2. Set environment variables  
3. Redeploy functions
4. Test with verification steps

---

## 📞 WHAT TO DO NEXT

1. **Follow steps 1-3 above immediately**
2. **Test with verification steps**  
3. **If issues persist, check Supabase function logs**
4. **Remove all the debug test files** (they were wasting time instead of fixing problems)

The webhook and token generation code looks correct after the recent fixes. The main issues are infrastructure: database security and missing environment variables. 