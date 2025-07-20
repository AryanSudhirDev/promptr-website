# Extension Changes Required for Free Plan

## 🔧 **Required Changes in VS Code Extension**

### **1. Token Validation & Plan Checking**
```typescript
// Before each request, check usage limit
const checkUsageLimit = async (token: string) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/check-usage-limit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ token })
  });

  const data = await response.json();
  
  if (!data.allowed) {
    // Show upgrade message
    vscode.window.showErrorMessage(
      `Free plan limit reached (100 requests/month). Upgrade to Pro for unlimited requests: https://usepromptr.com/pricing`
    );
    return false;
  }
  
  return true;
};
```

### **2. Integration Points**
- **Before AI request:** Call `checkUsageLimit()` before sending to OpenAI
- **Error handling:** Show upgrade message when limit reached
- **Status bar:** Display current plan (Free/Pro) and usage count
- **Settings:** Cache plan info locally (refresh every hour)

### **3. User Experience**
- **Free users:** Show usage count in status bar (e.g., "Free: 45/100")
- **Pro users:** Show "Pro: Unlimited" in status bar
- **Limit reached:** Block requests and show upgrade prompt
- **Upgrade link:** Direct users to https://usepromptr.com/pricing

### **4. Caching Strategy**
```typescript
// Cache plan info locally
interface CachedPlanInfo {
  plan: 'free' | 'pro';
  usage?: number;
  limit?: number;
  lastChecked: number;
}

// Refresh cache every hour
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
```

### **5. Error Messages**
- **Limit reached:** "Free plan limit reached (100 requests/month). Upgrade to Pro for unlimited requests."
- **Token invalid:** "Invalid access token. Please check your token in settings."
- **Network error:** "Unable to check usage limit. Please try again."

### **6. Settings Integration**
- **Token input:** Existing token field works for both plans
- **Plan display:** Show current plan in settings
- **Usage display:** Show current usage for free users

## 🚀 **Implementation Steps**

1. **Add usage checking function**
2. **Integrate before AI requests**
3. **Add status bar indicators**
4. **Implement error handling**
5. **Add caching mechanism**
6. **Update settings UI**
7. **Test both plans**

## 📊 **API Endpoints**

- **Check Usage:** `POST /functions/v1/check-usage-limit`
- **Response:** `{ allowed: boolean, plan: string, current_usage?: number, limit?: number, message: string }`

## 🎯 **Key Features**

- ✅ Same token works for both plans
- ✅ Real-time usage tracking
- ✅ Graceful limit enforcement
- ✅ Clear upgrade messaging
- ✅ Seamless plan switching 