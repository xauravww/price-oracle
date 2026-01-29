# 🚀 Multi-Key Support for Serper.dev

## Overview

The search service now supports **multiple Serper.dev API keys** with automatic round-robin rotation. This lets you scale your search capacity significantly!

## Benefits

### Single Key
- ✅ 2,500 searches/month
- ✅ ~83 searches/day

### Multiple Keys (3 keys example)
- ✅ **7,500 searches/month** (2,500 × 3)
- ✅ **250 searches/day**
- ✅ Automatic load distribution
- ✅ **Failover** - if one key hits limit, tries next key

## Setup

### Option 1: Multiple Keys (Recommended for Production)

```bash
# .env
SERPER_API_KEYS=key_abc123,key_def456,key_ghi789
```

The system will:
1. Rotate through keys using round-robin
2. If a key hits rate limit (429), tries next key
3. Distributes load evenly across all keys

### Option 2: Single Key (Backward Compatible)

```bash
# .env
SERPER_API_KEY=key_abc123
```

Works exactly as before - no changes needed!

## How It Works

### Round-Robin key Rotation
```typescript
Request 1 → Key 1
Request 2 → Key 2
Request 3 → Key 3
Request 4 → Key 1 (back to start)
...
```

### Automatic Failover
```typescript
Try Key 1 → 429 Rate Limit → Try Key 2 → ✅ Success
```

## Getting Multiple Keys

### Method 1: Multiple Accounts (Free)
1. Sign up  at https://serper.dev with email 1
2. Get API key 1
3. Sign up with email 2 (use Gmail +aliases)
4. Get API key 2
5. Repeat as needed

Example emails:
- `yourname+serper1@gmail.com`
- `yourname+serper2@gmail.com`
- `yourname+serper3@gmail.com`

### Method 2: Paid Plan (if needed)
- $50/month = 10,000 searches/month
- Better than managing multiple accounts

## Configuration Examples

### Development (Single Key)
```bash
SERPER_API_KEY=dev_key_123
```

### Production (3 Keys for 7,500/month)
```bash
SERPER_API_KEYS=prod_key_1,prod_key_2,prod_key_3
```

### High Volume (5 Keys for 12,500/month)
```bash
SERPER_API_KEYS=key1,key2,key3,key4,key5
```

## Vercel Deployment

Add to Environment Variables:
```
Name: SERPER_API_KEYS
Value: key1,key2,key3
```

**Important**: Use `SERPER_API_KEYS` (plural) for multiple keys!

## Monitoring Usage

### Check Health
```typescript
import { checkSearchHealth } from './lib/searchService';

const health = await checkSearchHealth();
console.log(health);
// {
//   serper: {
//     available: true,
//     keyCount: 3,
//     totalCapacity: 7500  // 2,500 × 3
//   }
// }
```

### View Logs
```
[Search] Attempting Serper.dev fallback... (3 keys)
[Serper] ✅ Success with key 1/3
```

Or if rate limited:
```
[Serper] Key 1: HTTP 429 - trying next key...
[Serper] ✅ Success with key 2/3
```

## Cost Optimization

### Maximize Free Tier
```bash
# 3 accounts = 7,500 free searches/month
SERPER_API_KEYS=account1_key,account2_key,account3_key
```

### When to Upgrade
If you need > 12,500 searches/month (5 free accounts), consider:
- Paid Serper plan: $50/month = 10,000 searches
- Or continue with 6+ free accounts

##Dashboard Monitoring

Track usage for each key:
1. Visit https://serper.dev/dashboard
2. Login with each account
3. Check remaining quota
4. Total quota = sum of all keys

## Migration from Single to Multiple Keys

### Before
```bash
SERPER_API_KEY=old_key_123
```

### After (keeps backward compatibility!)
```bash
# Option 1: Just add more keys
SERPER_API_KEYS=old_key_123,new_key_456,new_key_789

# Option 2: Keep old for dev, add new for prod
SERPER_API_KEY=dev_key          # Dev environment
SERPER_API_KEYS=k1,k2,k3        # Prod environment (higher priority)
```

## Example: Full Setup

### Step 1: Get 3 Free API Keys
```bash
1. Sign up: yourname+s1@gmail.com → Get key1
2. Sign up: yourname+s2@gmail.com → Get key2
3. Sign up: yourname+s3@gmail.com → Get key3
```

### Step 2: Add to .env
```bash
SERPER_API_KEYS=key1_here,key2_here,key3_here
```

### Step 3: Test
```bash
node test-serper.js
```

### Step 4: Deploy to Vercel
Add `SERPER_API_KEYS` to environment variables and redeploy.

### Step 5: Monitor
Check logs to see key rotation working:
```
[Search] Attempting Serper.dev fallback... (3 keys)
[Serper] ✅ Success with key 2/3
```

---

**Result**: You now have **7,500 free searches/month** instead of 2,500! 🎉
