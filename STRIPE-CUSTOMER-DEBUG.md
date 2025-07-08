# 🔍 Stripe Customer ID Debug Guide

## 🚨 Current Issue
**Error**: "No such customer: 'cus_Sdb3heCG97Tr18'" in Stripe logs after payment completion.

## 🎯 Root Cause Analysis

### 1. Environment Key Mismatch
Your frontend uses **LIVE** keys but Edge Functions might use **TEST** keys:

**Frontend (.env)**: 
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RhdJNE9moYSKNWT...
```

**Backend (Supabase Edge Functions)**: 
Check what `STRIPE_SECRET_KEY` is set to in your Supabase dashboard.

### 2. The Flow Problem
1. **Checkout Created**: ✅ Works (customer created in one mode)
2. **Payment Completed**: ✅ Webhook fires  
3. **Later Events**: ❌ Can't find customer (looking in wrong mode)

## 🔧 Immediate Fix

### Step 1: Check Your Supabase Environment Variables
Go to: [Supabase Edge Functions Settings](https://supabase.com/dashboard/project/xzrajxmrwumzzbnlozzr/settings/functions)

**Verify these match your frontend:**
- `STRIPE_SECRET_KEY` should be `sk_live_...` (matching your `pk_live_...`)
- `STRIPE_WEBHOOK_SECRET` should be from your LIVE webhook endpoint

### Step 2: Check Your Stripe Webhook Configuration
Go to: [Stripe Dashboard](https://dashboard.stripe.com/webhooks)

**Make sure you're in LIVE mode and webhook points to:**
```
https://xzrajxmrwumzzbnlozzr.supabase.co/functions/v1/stripe-webhooks
```

### Step 3: Verify Environment Consistency
All of these must match (test OR live, not mixed):
- ✅ Frontend: `pk_live_...` 
- ✅ Backend: `sk_live_...`
- ✅ Webhook: From live mode dashboard
- ✅ Price ID: From live mode products

## 🧪 Quick Test Commands

### Test Environment Variables:
```bash
curl -X POST "https://xzrajxmrwumzzbnlozzr.supabase.co/functions/v1/create-checkout-session?test=1" \
  -H "Authorization: Bearer [YOUR_ANON_KEY]" \
  -H "apikey: [YOUR_ANON_KEY]" \
  -d '{"email": "test@example.com"}'
```

### Test Customer Lookup in Database:
```bash
curl -X POST "https://xzrajxmrwumzzbnlozzr.supabase.co/functions/v1/get-user-token" \
  -H "Authorization: Bearer [YOUR_ANON_KEY]" \
  -H "apikey: [YOUR_ANON_KEY]" \
  -d '{"email": "YOUR_EMAIL_THAT_PAID"}'
```

## 🎯 Expected Results

**If everything is configured correctly:**
1. Environment test shows all `sk_live_...` keys
2. Customer lookup returns token successfully  
3. New payments complete without "customer not found" errors

## 📋 Checklist

- [ ] Frontend uses `pk_live_...`
- [ ] Backend uses `sk_live_...` 
- [ ] Webhook secret from live mode
- [ ] Price ID from live mode products
- [ ] Webhook URL points to correct function
- [ ] All in same Stripe account

## 🚑 If Still Broken

The issue might be that existing customers were created in test mode but you're now using live mode. You may need to:

1. **Clear the database** of test customers
2. **Start fresh** with all live mode keys
3. **Test a new payment** to verify the flow works

Let me know what the environment test shows and we can fix this! 