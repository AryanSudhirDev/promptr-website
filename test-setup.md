# 🧪 Complete Testing Guide

## 🎯 Testing Overview

Your backend system has 3 main components to test:
1. **Stripe Webhooks** - Handle payment events
2. **Token Validation** - Verify access tokens
3. **User Token Retrieval** - Get tokens by email

## 🔧 Setup Requirements

### 1. Environment Variables
Make sure these are set in your Supabase project:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 2. Stripe Webhook Configuration
In Stripe Dashboard (Test Mode):
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Set endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhooks`
4. Select these events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)

## 🧪 Testing Methods

### Method 1: Using Stripe Test Events (Recommended)

#### A. Test Checkout Completion
1. In Stripe Dashboard → **Developers** → **Events**
2. Click **"Send test webhook"**
3. Select `checkout.session.completed`
4. Use this test data:
```json
{
  "customer": "cus_test123",
  "customer_email": "test@example.com"
}
```

#### B. Test Payment Success
```json
{
  "customer": "cus_test123"
}
```

#### C. Test Payment Failure
```json
{
  "customer": "cus_test123"
}
```

### Method 2: Using Stripe CLI (Advanced)

1. Install Stripe CLI
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhooks`
4. Trigger events: `stripe trigger checkout.session.completed`

### Method 3: Manual API Testing

Use the test endpoints I'll create below to manually test your functions.

## 📊 Test Results to Expect

### After Checkout Completion:
- New user created in `user_access` table
- Status: `trialing`
- Unique `access_token` generated
- `stripe_customer_id` stored

### After Payment Success:
- User status updated to `active`

### After Payment Failure:
- User status updated to `inactive`

## 🔍 Monitoring & Debugging

### Check Supabase Logs:
1. Go to Supabase Dashboard
2. **Functions** → Select function → **Logs**
3. Look for console.log outputs

### Check Stripe Webhook Logs:
1. Stripe Dashboard → **Developers** → **Webhooks**
2. Click your webhook endpoint
3. View **Recent deliveries**

## ⚠️ Common Issues

1. **Webhook signature verification fails**
   - Check `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure it starts with `whsec_`

2. **Database permission errors**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set
   - Check RLS policies allow service role access

3. **CORS errors**
   - Functions include proper CORS headers
   - Should work from any origin

## 🎯 Success Criteria

✅ Webhooks process without errors
✅ Users created/updated in database
✅ Token validation returns correct access
✅ User can retrieve token by email