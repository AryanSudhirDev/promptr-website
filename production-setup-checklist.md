# 🚀 Production Setup Checklist

## Critical Steps to Fix Trial System

### 1. ⚠️ Set Environment Variables in Supabase

Go to **Supabase Dashboard → Your Project → Settings → Environment Variables**

Add these **critical** variables:

```bash
SITE_URL=https://your-actual-domain.com
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLERK_DOMAIN=your-domain.clerk.accounts.dev
```

### 2. 🔧 Configure Stripe Webhooks

In **Stripe Dashboard → Webhooks**, add endpoint:
- **URL:** `https://your-project.supabase.co/functions/v1/stripe-webhooks`
- **Events to send:**
  - ✅ `checkout.session.completed`
  - ✅ `customer.subscription.updated` ← **CRITICAL FOR TRIALS**
  - ✅ `invoice.payment_succeeded` 
  - ✅ `invoice.payment_failed`
  - ✅ `customer.subscription.deleted`

Copy the **webhook signing secret** (starts with `whsec_`) and add it to Supabase env vars.

### 3. 🎯 Test Trial Flow

1. **Create trial subscription** → Status should be "trialing"
2. **Wait for trial to end** → Should auto-transition to "active" or "inactive"
3. **Check webhook logs** in Stripe Dashboard
4. **Verify database status** matches Stripe subscription status

### 4. 🔍 Verify Production Setup

Check these URLs work:
- ✅ `https://your-domain.com` (frontend)
- ✅ `https://your-project.supabase.co/functions/v1/stripe-webhooks` (webhook endpoint)
- ✅ Clerk authentication redirects properly
- ✅ Stripe redirects to correct success/cancel URLs

### 5. ⚡ Deploy Latest Changes

Run these commands:
```bash
# Deploy Supabase functions with new webhook handler
supabase functions deploy stripe-webhooks

# Restart Supabase to pick up new environment variables  
supabase db restart

# Deploy frontend with production environment variables
npm run build && npm run deploy
```

---

## What Was Fixed

✅ **Added missing `customer.subscription.updated` webhook** - Now handles trial → active/inactive transitions  
✅ **Fixed production site URLs** - No more localhost fallbacks  
✅ **Environment variable requirements** - Clear documentation of what's needed  
✅ **Trial end handling** - Users now properly transition from trial to paid/cancelled 