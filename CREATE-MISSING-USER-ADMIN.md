# 🚑 Admin Fix: Create Missing User

## 🎯 Issue Summary
User `tayilo8135@fenexy.com` is authenticated in Clerk but missing from database because webhook failed during payment.

## 🔧 Immediate Fix (Run in Supabase SQL Editor)

```sql
-- Create the missing user with proper access token
INSERT INTO public.user_access (
    email,
    access_token,
    stripe_customer_id,
    status,
    created_at
) VALUES (
    'tayilo8135@fenexy.com',
    gen_random_uuid(),
    NULL, -- Will be updated when we find their Stripe customer ID
    'trialing', -- Start as trialing, can be updated based on payment status
    '2025-07-07'::timestamptz -- Match their Clerk signup date
) ON CONFLICT (email) DO NOTHING;

-- Verify creation
SELECT email, access_token, status, created_at 
FROM public.user_access 
WHERE email = 'tayilo8135@fenexy.com';
```

## 🔍 Future Prevention

### 1. Add Webhook Monitoring
Monitor Stripe webhook deliveries in dashboard and set up alerts for failures.

### 2. Add User Creation on First Access
Create users automatically when they first access the account dashboard (if authenticated via Clerk).

### 3. Stripe Customer ID Lookup
If the user actually paid, find their Stripe customer ID and update the record:

```sql
-- After finding their Stripe customer ID from Stripe dashboard
UPDATE public.user_access 
SET 
    stripe_customer_id = 'cus_THEIR_ACTUAL_ID',
    status = 'active' -- or 'trialing' based on their payment status
WHERE email = 'tayilo8135@fenexy.com';
```

## 🎯 Test After Fix

1. User should now see their access token
2. Subscription status should load properly
3. VS Code extension should work with their token

## 📋 Next Steps

1. Run the SQL script above
2. Have user refresh their account page
3. Monitor webhook logs for future failures
4. Consider implementing automatic user creation fallback 