# 🧪 Testing Guide

## Available Test Scripts

### 1. `scripts/test-serper.js` - API Key Validator
**Purpose**: Test individual Serper.dev API keys

```bash
node scripts/test-serper.js
```

**What it tests:**
- ✅ Validates each API key individually
- ✅ Shows which keys are working
- ✅ Calculates total capacity
- ✅ Displays sample search results

**When to use:**
- Setting up new API keys
- Troubleshooting key issues
- Checking key validity

---

### 2. `scripts/test-search-system.mjs` - Integration Test ⭐
**Purpose**: Test the complete search system with your actual configuration

```bash
node scripts/test-search-system.mjs
```

**What it tests:**
- ✅ Multi-key rotation (round-robin)
- ✅ DuckDuckGo → Serper fallback
- ✅ System health check
- ✅ Real search queries
- ✅ Result retrieval

**When to use:**
- After configuring SERPER_API_KEYS
- Before deploying to Vercel
- Verifying system integration
- **This is your main test!**

---

### 3. `scripts/test-searxng.js` - SearXNG Validator
**Purpose**: Test SearXNG instances (educational)

```bash
node scripts/test-searxng.js
```

**What it tests:**
- ❌ Shows why SearXNG doesn't work (rate limits)
- ℹ️ Educational purposes only

**When to use:**
- Understanding why we use Serper instead

---

## Quick Test Workflow

### Initial Setup
```bash
# 1. Add your keys to .env
echo "SERPER_API_KEYS=key1,key2,key3" >> .env

# 2. Test individual keys
node scripts/test-serper.js

# 3. Test full system integration
node scripts/test-search-system.mjs
```

### Expected Output (All Tests Passing)

```
🧪 PRICE ORACLE - SEARCH SYSTEM TEST

📋 ENVIRONMENT CONFIGURATION:
✅ SERPER_API_KEYS found: 3 key(s)
💰 Total Search Capacity: 7500 searches/month

🔍 TEST 1: Multi-Key Rotation Test
   Request 1: Using Key 1/3 ✅
   Request 2: Using Key 2/3 ✅
   Request 3: Using Key 3/3 ✅
   Summary: 3/3 requests successful

🔍 TEST 2: DuckDuckGo → Serper Fallback Test
   ✅ Serper fallback successful!
   📊 Retrieved 5 search results

🔍 TEST 3: System Health Check
   ✅ Serper: Available
   • API Keys: 3
   • Total Capacity: 7500 searches/month
   • Status: ✅ Operational

📊 FINAL RESULTS:
   Tests Passed: 3/3

🎉 ALL TESTS PASSED!
   Ready for production deployment! 🚀
```

---

## Troubleshooting

### Test Fails: "No API keys found"
```bash
# Check .env file exists
ls -la .env

# Verify content
cat .env | grep SERPER

# Expected:
# SERPER_API_KEYS=key1,key2,key3
```

### Test Fails: "HTTP 401"
- ❌ Invalid API key
- ✅ Check key at https://serper.dev/dashboard
- ✅ Regenerate if needed

### Test Fails: "HTTP 429"
- ❌ Key exceeded monthly limit (2,500 searches)
- ✅ Add more keys to rotate load
- ✅ Check usage at https://serper.dev/dashboard

### Rotation Not Working
- ℹ️ Need 2+ keys for rotation
- ✅ Add more keys: `SERPER_API_KEYS=key1,key2,key3`
- ✅ Rerun test

---

## Test Comparison

| Script | Purpose | Duration | Output |
|--------|---------|----------|--------|
| `scripts/test-serper.js` | Validate Keys | ~5s | Individual key status |
| `scripts/test-search-system.mjs` | Full Integration | ~10s | Complete system test |
| `scripts/test-searxng.js` | Educational | ~30s | Why SearXNG fails |

---

## Production Checklist

Before deploying to Vercel:

```bash
# 1. Run integration test
node scripts/test-search-system.mjs

# Expected: "ALL TESTS PASSED!"

# 2. Verify configuration
cat .env | grep SERPER

# 3. Check key count
# Recommended: 3+ keys for 7,500+ searches/month

# 4. Deploy to Vercel
# Add SERPER_API_KEYS to Vercel environment variables

# 5. Monitor logs
# Check Vercel logs for:
# [Search] ✅ Serper.dev returned X results
```

---

## Monitoring in Production

### Check Key Usage
Visit: https://serper.dev/dashboard

### Check System Logs
```bash
# Vercel deployment logs
vercel logs

# Look for:
[Search] Attempting DuckDuckGo...
[Search] ❌ DuckDuckGo failed: 403
[Search] Attempting Serper.dev fallback... (3 keys)
[Serper] ✅ Success with key 2/3
```

### Health Check Endpoint (Optional)
Add to your app:
```typescript
// app/api/health/route.ts
import { checkSearchHealth } from '@/lib/searchService';

export async function GET() {
  const health = await checkSearchHealth();
  return Response.json(health);
}
```

Then visit: `https://your-app.vercel.app/api/health`

---

## Summary

✅ **Main Test**: `node scripts/test-search-system.mjs`  
✅ **Key Validator**: `node scripts/test-serper.js`  
✅ **Production Ready**: All tests passing + Vercel env configured  

Your system is now bulletproof! 🛡️
