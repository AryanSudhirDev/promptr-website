#!/bin/bash

# Curl Test Scripts for Promptr API
# Replace YOUR_SUPABASE_URL with your actual Supabase project URL

SUPABASE_URL="https://YOUR_SUPABASE_URL.supabase.co"

echo "🧪 Testing Promptr API Endpoints"
echo "================================="

# Test 1: Validate Token (should fail - invalid token)
echo ""
echo "1️⃣ Testing Token Validation (Invalid Token)"
echo "-------------------------------------------"
curl -X POST "$SUPABASE_URL/functions/v1/validate-token" \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid-token"}' \
  -w "\nStatus: %{http_code}\n"

# Test 2: Validate Token (should fail - token not found)
echo ""
echo "2️⃣ Testing Token Validation (Valid UUID, Not Found)"
echo "---------------------------------------------------"
curl -X POST "$SUPABASE_URL/functions/v1/validate-token" \
  -H "Content-Type: application/json" \
  -d '{"token":"123e4567-e89b-12d3-a456-426614174000"}' \
  -w "\nStatus: %{http_code}\n"

# Test 3: Get User Token (should fail - user not found)
echo ""
echo "3️⃣ Testing Get User Token (User Not Found)"
echo "------------------------------------------"
curl -X POST "$SUPABASE_URL/functions/v1/get-user-token" \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com"}' \
  -w "\nStatus: %{http_code}\n"

# Test 4: Invalid request format
echo ""
echo "4️⃣ Testing Invalid Request Format"
echo "---------------------------------"
curl -X POST "$SUPABASE_URL/functions/v1/validate-token" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}' \
  -w "\nStatus: %{http_code}\n"

# Test 5: OPTIONS request (CORS)
echo ""
echo "5️⃣ Testing CORS (OPTIONS Request)"
echo "---------------------------------"
curl -X OPTIONS "$SUPABASE_URL/functions/v1/validate-token" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "✅ Basic API tests completed!"
echo ""
echo "📝 Next Steps:"
echo "1. Create a test user in your database"
echo "2. Get the generated access_token"
echo "3. Test validation with the real token"
echo "4. Set up Stripe webhooks for full testing"