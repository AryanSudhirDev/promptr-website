# Promptr - Backend System Documentation

## Overview

This backend system manages user access tokens for the Promptr VS Code extension using Supabase and Stripe integration. Users can start a free trial or purchase access, and receive a unique token to unlock premium features in the extension.

## Architecture

### Database Schema

**Table: `user_access`**
- `id` (uuid, primary key)
- `email` (text, unique, not null)
- `access_token` (uuid, unique, auto-generated)
- `stripe_customer_id` (text, unique)
- `status` (text) - 'trialing', 'active', 'inactive'
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### API Endpoints

#### 1. Stripe Webhooks (`/functions/v1/stripe-webhooks`)

Handles the following Stripe events:

- **`checkout.session.completed`**: Creates new user or updates existing user to 'trialing' status
- **`invoice.payment_succeeded`**: Updates user status to 'active'
- **`invoice.payment_failed`**: Updates user status to 'inactive'
- **`customer.subscription.deleted`**: Updates user status to 'inactive'

**Security**: Verifies Stripe webhook signatures using `STRIPE_WEBHOOK_SECRET`

#### 2. Token Validation (`/functions/v1/validate-token`)

**Method**: POST
**Body**: `{ "token": "uuid-string" }`
**Response**: `{ "access": boolean }`

Validates access tokens from VS Code extension:
- Returns `{ "access": true }` for users with 'trialing' or 'active' status
- Returns `{ "access": false }` for invalid tokens or 'inactive' users
- Includes UUID format validation and secure error handling

#### 3. Get User Token (`/functions/v1/get-user-token`)

**Method**: POST
**Body**: `{ "email": "user@example.com" }`
**Response**: `{ "success": boolean, "token"?: string, "status"?: string, "message"?: string }`

Allows users to retrieve their access token by email:
- Returns token and current status for existing users
- Provides helpful error messages for users without access

## Environment Variables

Required environment variables in Supabase:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Service role access only** - no public access to user data
- **Webhook signature verification** for all Stripe events
- **UUID format validation** for access tokens
- **Secure error handling** - no sensitive data in error responses
- **CORS headers** properly configured for all endpoints

## Usage Flow

1. **User starts trial/purchase**: Stripe Checkout creates session
2. **Webhook processes payment**: `checkout.session.completed` creates user with token
3. **User gets token**: Via email lookup using `/get-user-token` endpoint
4. **VS Code extension validates**: Uses `/validate-token` for feature access
5. **Status updates**: Stripe webhooks automatically update user status based on payment events

## Database Indexes

Performance indexes created on:
- `email` (for user lookups)
- `access_token` (for token validation)
- `stripe_customer_id` (for webhook processing)
- `status` (for access queries)

## Error Handling

All endpoints include comprehensive error handling:
- Invalid request formats
- Missing or malformed tokens
- Database connection issues
- Stripe webhook signature failures
- User not found scenarios

## Testing

To test the system:

1. **Webhook testing**: Use Stripe CLI to forward webhooks to local development
2. **Token validation**: Send POST requests to validate-token endpoint
3. **User lookup**: Test get-user-token with various email scenarios

## Production Deployment

1. Set up Supabase project with environment variables
2. Deploy edge functions using Supabase dashboard
3. Configure Stripe webhook endpoints to point to your Supabase functions
4. Test webhook delivery and token validation flows