-- Test Database Queries
-- Run these in Supabase SQL Editor AFTER migration is complete

-- 1. Check if table exists and view structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_access' 
ORDER BY ordinal_position;

-- 2. View all users (should be empty initially)
SELECT * FROM user_access;

-- 3. Create a test user manually
INSERT INTO user_access (email, stripe_customer_id, status)
VALUES ('test@example.com', 'cus_test123', 'trialing')
RETURNING *;

-- 4. Test token validation query (use actual token from step 3)
-- First, get a real token:
SELECT access_token FROM user_access WHERE email = 'test@example.com';

-- Then test validation (replace with actual token from above):
-- SELECT status FROM user_access WHERE access_token = 'paste-actual-token-here';

-- 5. Test user lookup by email
SELECT access_token, status 
FROM user_access 
WHERE email = 'test@example.com';

-- 6. Update user status (simulate payment success)
UPDATE user_access 
SET status = 'active' 
WHERE stripe_customer_id = 'cus_test123'
RETURNING *;

-- 7. Check indexes are created
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'user_access';

-- 8. Test RLS policies (should only work with service role)
SELECT * FROM user_access; -- This should work in SQL editor (uses service role)

-- 9. Test status constraint
-- This should fail:
-- INSERT INTO user_access (email, status) VALUES ('invalid@test.com', 'invalid_status');

-- 10. Test auto-generated tokens
INSERT INTO user_access (email, status)
VALUES ('auto-token@test.com', 'trialing')
RETURNING access_token, email, status;

-- 11. Clean up test data when done
-- DELETE FROM user_access WHERE email LIKE '%test.com';