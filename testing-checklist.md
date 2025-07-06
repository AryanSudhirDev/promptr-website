# 🧪 Promptr Backend Testing Checklist

## 🎯 Quick Start Testing

### 1. **Open the Test Interface**
- Open `test-complete-setup.html` in your browser
- Enter your Supabase URL: `https://your-project.supabase.co`

### 2. **Run Tests in Order**
Follow the numbered steps in the test interface:

#### ✅ **Step 1: Configuration**
- Validates connection to your Supabase functions
- Should show "Configuration Valid"

#### ✅ **Step 2: Database Schema**
- Creates a test user in your database
- Auto-fills the access token for next tests
- Verifies database structure is correct

#### ✅ **Step 3: Token Validation**
- Tests the `validate-token` endpoint
- Should return `access: true` for valid tokens
- Tests invalid tokens return `access: false`

#### ✅ **Step 4: Get User Token**
- Tests the `get-user-token` endpoint
- Should return token for existing users
- Tests non-existent users return error

#### ✅ **Step 5: Webhook Simulation**
- Simulates Stripe webhook events
- Tests user creation and status updates
- Note: Will show signature errors (expected in test mode)

#### ✅ **Step 6: Complete Flow**
- Runs end-to-end test of entire system
- Creates user → Gets token → Validates token → Updates status

## 🔍 What Success Looks Like

### ✅ **All Green Results**
- Configuration: ✅ Valid connection
- Database: ✅ User created with token
- Token Validation: ✅ Returns correct access status
- Get User Token: ✅ Returns token for existing users
- Webhooks: ✅ Processes events (signature errors OK)
- Complete Flow: ✅ End-to-end success

### 📊 **Test Summary**
The test interface shows a summary of all test results at the bottom.

## 🚨 Troubleshooting

### ❌ **Configuration Fails**
- Check Supabase URL is correct
- Ensure edge functions are deployed
- Check project is not paused

### ❌ **Database Tests Fail**
- Verify migration was applied successfully
- Check RLS policies are set up
- Ensure service role key is configured

### ❌ **Token Validation Fails**
- Check environment variables in Supabase
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Test with a real token from database

### ❌ **Webhook Tests Fail**
- Signature verification errors are expected in test mode
- Check `STRIPE_SECRET_KEY` is configured
- For real testing, use Stripe Dashboard webhooks

## 🎯 Production Testing

### **Real Stripe Webhook Testing**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhooks`
3. Select events: `checkout.session.completed`, `invoice.payment_succeeded`, etc.
4. Use "Send test webhook" feature
5. Check Supabase function logs for results

### **VS Code Extension Testing**
1. Get a real access token from your database
2. Configure VS Code extension with your token
3. Test prompt refinement features
4. Verify token validation works in production

## 📝 Manual Database Testing

If you prefer SQL testing, run these queries in Supabase SQL Editor:

```sql
-- 1. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_access';

-- 2. Create test user
INSERT INTO user_access (email, stripe_customer_id, status)
VALUES ('manual-test@example.com', 'cus_manual123', 'trialing')
RETURNING *;

-- 3. Get token for testing
SELECT access_token, status FROM user_access 
WHERE email = 'manual-test@example.com';

-- 4. Test status update
UPDATE user_access SET status = 'active' 
WHERE email = 'manual-test@example.com'
RETURNING *;
```

## 🎉 Success Criteria

Your system is ready when:
- ✅ All 6 test steps pass
- ✅ Test summary shows all green
- ✅ You can create users and validate tokens
- ✅ Webhook simulation works (signature errors OK)
- ✅ Complete flow test succeeds

**Next Step:** Configure real Stripe webhooks and test with VS Code extension!