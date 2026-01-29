/**
 * Search Service with Fallback Chain
 * 
 * Primary: DuckDuckGo (free, but may get rate-limited on Vercel)
 * Fallback 1: Serper.dev (2,500 searches/month PER KEY)
 * 
 * To use Serper.dev with multiple keys:
 * 1. Sign up at https://serper.dev
 * 2. Get multiple API keys (each has 2,500 free searches/month)
 * 3. Add to .env: SERPER_API_KEYS=key1,key2,key3
 * 
 * Backward compatible: Also supports single SERPER_API_KEY
 */

import { DDGS } from '@phukon/duckduckgo-search';

export interface SearchResult {
  title: string;
  body: string;
  href: string;
}

interface SerperResult {
  organic?: Array<{
    title: string;
    snippet: string;
    link: string;
  }>;
}

/**
 * Get list of Serper API keys from environment
 * Supports both single key (SERPER_API_KEY) and multiple keys (SERPER_API_KEYS)
 */
function getSerperApiKeys(): string[] {
  // Try SERPER_API_KEYS first (comma-separated)
  const multiKeys = process.env.SERPER_API_KEYS;
  if (multiKeys) {
    return multiKeys.split(',').map(key => key.trim()).filter(key => key.length > 0);
  }

  // Fallback to single SERPER_API_KEY for backward compatibility
  const singleKey = process.env.SERPER_API_KEY;
  if (singleKey) {
    return [singleKey.trim()];
  }

  return [];
}

// Round-robin counter for API key rotation
let serperKeyIndex = 0;

/**
 * Get next API key using round-robin rotation
 * This distributes load evenly across all keys
 */
function getNextSerperKey(): string | null {
  const keys = getSerperApiKeys();
  if (keys.length === 0) return null;

  const key = keys[serperKeyIndex % keys.length];
  serperKeyIndex = (serperKeyIndex + 1) % keys.length;
  return key;
}

/**
 * Search using Serper.dev API with multi-key support
 * Free tier: 2,500 searches/month PER KEY
 * Docs: https://serper.dev/playground
 * 
 * Supports multiple API keys for load distribution:
 * - Set SERPER_API_KEYS=key1,key2,key3 for rotation
 * - Or SERPER_API_KEY=single_key for backward compatibility
 */
async function searchWithSerper(query: string): Promise<SearchResult[]> {
  const keys = getSerperApiKeys();

  if (keys.length === 0) {
    throw new Error('SERPER_API_KEYS not configured');
  }

  const errors: string[] = [];

  // Try each key until one works (useful if a key hits rate limit)
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const apiKey = getNextSerperKey();
    if (!apiKey) break;

    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          gl: 'in', // India
          hl: 'en', // English
          num: 10,  // Number of results
        }),
      });

      if (!response.ok) {
        const errorMsg = `Key ${attempt + 1}: HTTP ${response.status}`;
        errors.push(errorMsg);

        // If rate limited (429), try next key
        if (response.status === 429 && attempt < keys.length - 1) {
          console.log(`[Serper] ${errorMsg} - trying next key...`);
          continue;
        }

        throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
      }

      const data: SerperResult = await response.json();

      if (!data.organic || data.organic.length === 0) {
        return [];
      }

      console.log(`[Serper] ✅ Success with key ${attempt + 1}/${keys.length}`);

      return data.organic.map((result) => ({
        title: result.title,
        body: result.snippet,
        href: result.link,
      }));

    } catch (error: any) {
      errors.push(`Key ${attempt + 1}: ${error.message}`);

      // If not the last key, try next one
      if (attempt < keys.length - 1) {
        console.log(`[Serper] Error with key ${attempt + 1}, trying next...`);
        continue;
      }

      throw error;
    }
  }

  throw new Error(`All Serper API keys failed: ${errors.join('; ')}`);
}

/**
 * Search using DuckDuckGo
 */
async function searchWithDuckDuckGo(query: string): Promise<SearchResult[]> {
  const ddgs = new DDGS();
  const results = await ddgs.text({ keywords: query });

  return results
    .filter((r: any) => r.href && r.href.startsWith('http'))
    .map((r: any) => ({
      title: r.title,
      body: r.body,
      href: r.href,
    }));
}

/**
 * Multi-provider search with automatic fallback
 * Tries DuckDuckGo first, falls back to Serper.dev if it fails
 */
export async function performWebSearch(query: string): Promise<SearchResult[]> {
  const errors: string[] = [];

  // Try DuckDuckGo first (free, unlimited but may get blocked)
  try {
    console.log('[Search] Attempting DuckDuckGo...');
    const results = await searchWithDuckDuckGo(query);

    if (results.length > 0) {
      console.log(`[Search] ✅ DuckDuckGo returned ${results.length} results`);
      return results;
    }

    console.log('[Search] ⚠️ DuckDuckGo returned 0 results');
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    console.error('[Search] ❌ DuckDuckGo failed:', errorMsg);
    errors.push(`DuckDuckGo: ${errorMsg}`);
  }

  // Fallback to Serper.dev (tries all keys if multiple provided)
  try {
    const keyCount = getSerperApiKeys().length;
    console.log(`[Search] Attempting Serper.dev fallback... (${keyCount} key${keyCount > 1 ? 's' : ''})`);
    const results = await searchWithSerper(query);

    if (results.length > 0) {
      console.log(`[Search] ✅ Serper.dev returned ${results.length} results`);
      return results;
    }

    console.log('[Search] ⚠️ Serper.dev returned 0 results');
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    console.error('[Search] ❌ Serper.dev failed:', errorMsg);
    errors.push(`Serper: ${errorMsg}`);
  }

  // All providers failed
  console.error('[Search] 🚫 All search providers failed');
  throw new Error(`All search providers failed: ${errors.join('; ')}`);
}

/**
 * Health check for search providers
 */
export async function checkSearchHealth() {
  const serperKeys = getSerperApiKeys();

  const status = {
    duckduckgo: { available: false, error: null as string | null },
    serper: {
      available: false,
      error: null as string | null,
      keyCount: serperKeys.length,
      totalCapacity: serperKeys.length * 2500
    },
  };

  // Check DuckDuckGo
  try {
    const ddgs = new DDGS();
    await ddgs.text({ keywords: 'test' });
    status.duckduckgo.available = true;
  } catch (error: any) {
    status.duckduckgo.error = error.message;
  }

  // Check Serper
  try {
    if (serperKeys.length === 0) {
      status.serper.error = 'No API keys configured';
    } else {
      await searchWithSerper('test');
      status.serper.available = true;
    }
  } catch (error: any) {
    status.serper.error = error.message;
  }

  return status;
}
