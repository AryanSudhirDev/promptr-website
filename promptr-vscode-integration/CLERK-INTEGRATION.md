# 🔐 Clerk-Based Authentication Integration

This is the **easier and more secure** approach using Clerk user authentication instead of manual tokens.

## 🎯 How It Works

1. **Extension gets Clerk user ID/email** from VS Code authentication
2. **Sends to backend** (`validate-clerk-user` edge function)
3. **Backend checks Stripe status** for that user
4. **Real-time access control** - no manual token management needed

## 🚀 Benefits Over Token Approach

- ✅ **Zero setup** - users just sign in once
- ✅ **Real-time sync** - Stripe cancellations immediately block access
- ✅ **More secure** - no token storage/management
- ✅ **Better UX** - seamless authentication flow
- ✅ **Automatic cleanup** - cancelled subscriptions immediately blocked

## 📁 Files You Need

### Backend (Supabase Edge Function)
- `supabase/functions/validate-clerk-user/index.ts` - Validates Clerk users

### Extension Files
- `src/clerk-auth.ts` - Clerk authentication logic
- `src/extension-integration-clerk.ts` - Integration examples

## 🔧 Integration Steps

### 1. Deploy the Edge Function

The `validate-clerk-user` function is ready to deploy. It:
- Accepts `clerk_user_id` or `email` 
- Checks your existing `user_access` table
- Returns subscription status from Stripe

### 2. Update Your Extension

**Replace your existing auth with Clerk auth:**

```typescript
// In your extension.ts
import { checkClerkUserAccess, setExtensionContext, enterEmailCommand } from './clerk-auth';

export function activate(context: vscode.ExtensionContext) {
  setExtensionContext(context);
  
  // Update your generatePrompt command
  const generatePromptCommand = vscode.commands.registerCommand('promptr.generatePrompt', async () => {
    // Use Clerk auth instead of token auth
    const hasAccess = await checkClerkUserAccess();
    if (!hasAccess) {
      return;
    }

    // Your existing logic...
  });

  // Update your enterAccessToken command
  const enterTokenCommand = vscode.commands.registerCommand('promptr.enterAccessToken', async () => {
    await enterEmailCommand(); // Now prompts for email instead of token
  });
}
```

### 3. VS Code Authentication Setup (Optional)

For seamless Clerk integration, add to your `package.json`:

```json
{
  "contributes": {
    "authentication": [
      {
        "id": "clerk",
        "label": "Promptr Account",
        "description": "Sign in to your Promptr account"
      }
    ]
  }
}
```

## 🔄 User Experience Flow

### First Time
1. User runs any command
2. Extension detects no Clerk session
3. Prompts: "Please sign in to your Promptr account"
4. User clicks "Sign In" → opens https://promptr.dev/sign-in
5. User signs in with Clerk
6. Extension validates subscription status
7. ✅ Access granted or ❌ Subscription issues shown

### Subsequent Uses
1. User runs command
2. Extension automatically validates subscription
3. ✅ Works immediately or ❌ Shows subscription issues

### Subscription Cancelled
1. User runs command
2. Backend detects inactive subscription
3. ❌ "Subscription inactive - update payment method"
4. User redirected to billing portal

## 🛡️ Security Features

- ✅ **No token storage** - uses VS Code's built-in auth
- ✅ **Real-time validation** - checks Stripe status on every request
- ✅ **Automatic blocking** - cancelled subscriptions immediately blocked
- ✅ **Secure backend** - all validation happens server-side

## 📊 API Endpoint

**URL:** `https://xzrajxmrwumzzbnlozzr.supabase.co/functions/v1/validate-clerk-user`

**Request:**
```json
{
  "clerk_user_id": "user_123abc",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "access": true,
  "status": "active",
  "email": "user@example.com",
  "user_id": "user_123abc"
}
```

## 🎯 Implementation Options

### Option 1: Full Clerk Integration
- Use VS Code's authentication API
- Seamless sign-in experience
- Requires Clerk SDK setup

### Option 2: Email-Only (Simpler)
- Just prompt for email
- No Clerk SDK needed
- Still validates against Stripe

### Option 3: Hybrid
- Try Clerk auth first
- Fallback to email entry
- Best of both worlds

## 🚨 Important Notes

1. **Database Schema**: Your existing `user_access` table works perfectly
2. **Stripe Sync**: Webhooks already update subscription status
3. **Real-time**: No caching - every request checks current status
4. **Fallback**: Email entry works if Clerk auth fails

## 🧪 Testing

Test the endpoint:
```bash
curl -X POST https://xzrajxmrwumzzbnlozzr.supabase.co/functions/v1/validate-clerk-user \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"email":"test@example.com"}'
```

## 🎉 Result

Users get:
- **Zero setup** - just sign in once
- **Real-time access** - immediate Stripe sync
- **Professional UX** - seamless authentication
- **Automatic blocking** - cancelled subscriptions blocked instantly

This approach is **much better** than manual tokens! 