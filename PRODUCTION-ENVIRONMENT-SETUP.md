# 🚀 PRODUCTION ENVIRONMENT SETUP

## ✅ FIXED: Hardcoded URLs Removed
All frontend components now use environment variables instead of hardcoded Supabase URLs.

## 📋 REQUIRED ENVIRONMENT VARIABLES

### Frontend Variables (.env.production)
Create a `.env.production` file in your project root:

```bash
# Your production Supabase project URL
VITE_SUPABASE_URL=https://your-production-project.supabase.co

# Your production Supabase anon key (safe to expose in frontend)
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Your production Stripe publishable key (safe to expose in frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-production-publishable-key
```

### Backend Variables (Supabase Dashboard)
Set these in [Supabase Dashboard > Settings > Edge Functions](https://supabase.com/dashboard/project/your-project/settings/functions):

```bash
# Your production site URL (where your frontend is deployed)
SITE_URL=https://your-production-domain.com

# Environment identifier
ENVIRONMENT=production

# Your production Supabase project URL (backend)
SUPABASE_URL=https://your-production-project.supabase.co

# Your production Supabase service role key (KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Your production Stripe secret key (KEEP SECRET!)
STRIPE_SECRET_KEY=sk_live_your-production-secret-key

# Your production Stripe webhook secret (KEEP SECRET!)
STRIPE_WEBHOOK_SECRET=whsec_your-production-webhook-secret
```

## 🔍 WHERE TO FIND THESE VALUES

### Supabase Values
1. **Project URL & Keys**: [Supabase Dashboard > Settings > API](https://supabase.com/dashboard/project/your-project/settings/api)
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (secret)

### Stripe Values
1. **API Keys**: [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys)
   - `VITE_STRIPE_PUBLISHABLE_KEY` = Publishable key (starts with pk_live_)
   - `STRIPE_SECRET_KEY` = Secret key (starts with sk_live_)

2. **Webhook Secret**: [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
   - Create webhook endpoint: `https://your-production-project.supabase.co/functions/v1/stripe-webhooks`
   - Copy signing secret: `STRIPE_WEBHOOK_SECRET` (starts with whsec_)

## 🚀 DEPLOYMENT STEPS

### 1. Frontend Deployment
```bash
# Create production environment file
cp .env.production.example .env.production

# Edit .env.production with your production values
nano .env.production

# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
```

### 2. Backend Configuration
1. Go to [Supabase Dashboard > Settings > Edge Functions](https://supabase.com/dashboard/project/your-project/settings/functions)
2. Add all backend environment variables listed above
3. Save changes

### 3. Database Security
1. Run the SQL script from `manual-db-security-fix.sql` in production
2. Verify RLS policies are active

## 🔒 SECURITY CHECKLIST

### ✅ Safe to Expose (Frontend)
- `VITE_SUPABASE_URL` - Public project URL
- `VITE_SUPABASE_ANON_KEY` - Public anon key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Public publishable key

### ❌ Keep Secret (Backend Only)
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- `STRIPE_SECRET_KEY` - Payment processing
- `STRIPE_WEBHOOK_SECRET` - Webhook verification

## 🧪 TESTING PRODUCTION SETUP

After deployment, test:
1. ✅ Frontend loads without console errors
2. ✅ User authentication works
3. ✅ Payment flow works
4. ✅ Webhooks process correctly
5. ✅ Database policies are active

## 🚨 COMMON ISSUES

### Frontend shows "Cannot connect to Supabase"
- Check `VITE_SUPABASE_URL` is correct
- Verify `VITE_SUPABASE_ANON_KEY` is set

### Payments fail with "Invalid API key"
- Check `STRIPE_SECRET_KEY` is production key (sk_live_)
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` matches secret key

### Database access denied
- Run `manual-db-security-fix.sql` in production
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct

### Webhooks fail
- Update Stripe webhook URL to production
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

## 📝 NEXT STEPS

1. **Complete the environment setup above**
2. **Follow the remaining items in `FINAL-PRODUCTION-CHECKLIST.md`**
3. **Test all critical user flows**
4. **Monitor for any issues** 