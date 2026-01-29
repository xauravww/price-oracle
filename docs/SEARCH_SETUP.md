# 🔧 Fixing Vercel Web Search Errors

## Problem
DuckDuckGo blocks requests from Vercel with 403 errors due to bot detection/rate limiting, causing search failures in production.

## Solution
Implemented a **multi-provider fallback system**:
1. **Primary**: DuckDuckGo (works locally, free, unlimited)
2. **Fallback**: Serper.dev (2,500 free searches/month when DDG fails)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Serper.dev API Key (FREE)

1. Visit [https://serper.dev](https://serper.dev)
2. Click "Sign Up" (Google sign-in available)
3. Go to [Dashboard](https://serper.dev/dashboard)
4. Copy your **API Key**

**Free Tier Limits:**
- ✅ 2,500 searches/month
- ✅ ~83 searches per day
- ✅ No credit card required
- ✅ Google Search results (high quality)

### Step 2: Add to Environment Variables

#### Local Development
```bash
# .env (create if doesn't exist)
SERPER_API_KEY=your_actual_api_key_here
```

#### Vercel Production
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `SERPER_API_KEY`
   - **Value**: Your Serper API key
   - **Environment**: Production, Preview, Development (select all)
4. Click "Save"
5. Redeploy your application

### Step 3: Verify It Works

The system automatically falls back to Serper when DuckDuckGo fails. Check your logs:

```
[Search] Attempting DuckDuckGo...
[Search] ❌ DuckDuckGo failed: Request failed with status code 403
[Search] Attempting Serper.dev fallback...
[Search] ✅ Serper.dev returned 10 results
```

---

## 📊 How It Works

```typescript
// 1. Try DuckDuckGo first (free, unlimited)
try {
  results = await searchWithDuckDuckGo(query);
  if (results.length > 0) return results; // ✅ Success
} catch (error) {
  console.log('DuckDuckGo failed, trying fallback...');
}

// 2. Fallback to Serper.dev automatically
try {
  results = await searchWithSerper(query);
  return results; // ✅ Success via fallback
} catch (error) {
  throw new Error('All search providers failed');
}
```

---

## 🎯 Expected Behavior

### Locally (Development)
- ✅ DuckDuckGo usually works
- ⚡ Fast, unlimited searches
- 🔄 Serper fallback rarely needed

### On Vercel (Production)
- ⚠️ DuckDuckGo often blocked (403)
- 🔄 **Serper.dev kicks in automatically**
- ✅ Seamless user experience
- 📊 ~83 searches/day limit (plenty for most apps)

---

## 💡 Cost Optimization Tips

### Monitor Usage
Check your Serper dashboard: [https://serper.dev/dashboard](https://serper.dev/dashboard)

### If You Hit Limits (2,500/month)
1. **Cache results** - Store search results in your database
2. **Rate limiting** - Limit queries per user
3. **Upgrade** - Serper paid plans start at $50/month (10,000 searches)

### Alternative Free Options (if needed)
- **Brave Search API**: 2,000 queries/month
- **Bing Web Search API**: $3-7 per 1,000 queries (Azure)

---

## 🧪 Testing

Run the test script to verify both providers:
```bash
node test-searxng.js
```

Check provider health:
```typescript
import { checkSearchHealth } from './lib/searchService';

const status = await checkSearchHealth();
console.log(status);
// {
//   duckduckgo: { available: false, error: "403 Forbidden" },
//   serper: { available: true, error: null }
// }
```

---

## 📝 Files Changed

1. **`src/lib/searchService.ts`** - New multi-provider search service
2. **`src/lib/actions.ts`** - Updated to use new search service
3. **`.env.example`** - Added SERPER_API_KEY documentation

---

## ❓ Troubleshooting

### "SERPER_API_KEY not configured" error
- Add the key to your `.env` file
- Restart your dev server
- On Vercel: Add to environment variables and redeploy

### Still getting 403 errors
- Check if SERPER_API_KEY is set correctly
- Verify API key is active on Serper dashboard
- Check you haven't exceeded monthly limit

### "All search providers failed"
- DuckDuckGo blocked AND Serper limit reached/misconfigured
- Check Serper dashboard for usage/status
- Verify API key is valid

---

## 🎉 Done!

Your app now has **bulletproof search** that works both locally and on Vercel. DuckDuckGo errors won't affect your users anymore!
