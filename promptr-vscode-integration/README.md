# 🔐 Promptr Token Authentication Integration

Secure token-based authentication for your VS Code extension.

## 🎯 What This Does

- **User gets unique access token** from your dashboard
- **Extension validates token** against backend
- **Backend checks Stripe subscription status** for that token's user
- **Real-time access control** - cancelled subscriptions immediately blocked
- **Secure token storage** - stored in VS Code's secret storage

## 📁 Files

```
promptr-vscode-integration/
├── src/
│   ├── token-auth.ts           ← Core token authentication logic
│   └── extension-integration.ts ← Example integration code
├── CLERK-INTEGRATION.md        ← Alternative Clerk approach (not used)
└── README.md                   ← This file
```

## 🚀 Quick Integration

### 1. Copy the core file
```bash
cp promptr-vscode-integration/src/token-auth.ts /path/to/your-extension/src/
```

### 2. Update your extension.ts
```typescript
// Add import
import { checkUserAccess, setExtensionContext, enterAccessTokenCommand } from './token-auth';

export function activate(context: vscode.ExtensionContext) {
  // Add this line
  setExtensionContext(context);
  
  // Update your generatePrompt command
  const generatePromptCommand = vscode.commands.registerCommand('promptr.generatePrompt', async () => {
    // Add these 4 lines
    const hasAccess = await checkUserAccess();
    if (!hasAccess) {
      return;
    }

    // Your existing logic here...
  });

  // Update your enterAccessToken command
  const enterTokenCommand = vscode.commands.registerCommand('promptr.enterAccessToken', async () => {
    await enterAccessTokenCommand();
  });
}
```

### 3. Deploy the backend
Deploy the `promptr-token-check` edge function to your Supabase project.

## ✅ That's It!

Your extension now has:
- ✅ **Secure token validation** using your existing backend
- ✅ **Real-time Stripe sync** 
- ✅ **Automatic subscription blocking**
- ✅ **Professional UX** - seamless token entry and storage

## 🔄 User Experience

1. **First time**: User runs command → prompted for token → validates subscription
2. **Subsequent uses**: Automatic validation → works immediately  
3. **Cancelled subscription**: Immediately blocked → redirected to billing

## 🛡️ Security Features

- ✅ **Secure token storage** - uses VS Code's secret storage API
- ✅ **Real-time validation** - checks Stripe status on every request
- ✅ **Automatic blocking** - cancelled subscriptions immediately blocked
- ✅ **Secure backend** - all validation happens server-side
- ✅ **No token guessing** - unique tokens prevent unauthorized access

## 🔑 Token System

- **Unique tokens** - each user gets a unique access token
- **Dashboard access** - users get tokens from https://promptr.dev/dashboard
- **Secure storage** - tokens stored in VS Code's encrypted secret storage
- **Automatic cleanup** - invalid tokens automatically removed

## 📊 API Endpoint

**URL:** `https://xzrajxmrwumzzbnlozzr.supabase.co/functions/v1/promptr-token-check`

**Request:**
```json
{
  "promptr_token": "user_unique_token_here"
}
```

**Response:**
```json
{
  "valid": true,
  "status": "active",
  "email": "user@example.com",
  "message": "Access granted for active subscription"
}
```

## 🎯 Implementation

The token approach is:
- ✅ **Secure** - unique tokens prevent unauthorized access
- ✅ **Simple** - just one input field for users
- ✅ **Reliable** - works with your existing infrastructure
- ✅ **Real-time** - immediate Stripe status sync

## 📚 Next Steps

1. **Deploy the edge function** to Supabase
2. **Copy `token-auth.ts`** to your extension
3. **Update your commands** to use `checkUserAccess()`
4. **Test with real tokens** from your dashboard 