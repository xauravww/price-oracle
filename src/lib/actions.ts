"use server";

import db, { getEmbedding } from './db';
import { PriceEntry } from './priceEngine';
import { DDGS } from '@phukon/duckduckgo-search';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT } from 'jose';

export async function getEntries(page: number = 1, limit: number = 10): Promise<{ entries: PriceEntry[], totalPages: number, totalCount: number }> {
  const offset = (page - 1) * limit;
  
  const stmt = db.prepare('SELECT * FROM price_entries ORDER BY timestamp DESC LIMIT ? OFFSET ?');
  const rows = stmt.all(limit, offset) as any[];
  
  const totalCountResult = db.prepare('SELECT COUNT(*) as count FROM price_entries').get() as { count: number };
  const totalCount = totalCountResult.count;
  
  const entries = rows.map(row => ({
    ...row,
    timestamp: new Date(row.timestamp),
    isTrusted: Boolean(row.isTrusted)
  })) as PriceEntry[];

  return {
    entries,
    totalPages: Math.ceil(totalCount / limit),
    totalCount
  };
}

export async function addEntry(entry: Omit<PriceEntry, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'isTrusted'>) {
  const id = Math.random().toString(36).substr(2, 9);
  
  const stmt = db.prepare(`
    INSERT INTO price_entries (id, item, location, price, contributorId)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, entry.item, entry.location, entry.price, entry.contributorId);

  try {
    const embedding = await getEmbedding(entry.item);
    const vecStmt = db.prepare(`
      INSERT INTO vec_items (id, embedding)
      VALUES (?, ?)
    `);
    vecStmt.run(id, new Float32Array(embedding));
  } catch (error) {
    console.error("Failed to save embedding:", error);
  }

  try {
    revalidatePath('/');
  } catch {
  }
}

export async function searchSimilarEntries(query: string): Promise<PriceEntry[]> {
  try {
    const queryEmbedding = await getEmbedding(query);
    
    const stmt = db.prepare(`
      SELECT 
        p.*,
        v.distance
      FROM vec_items v
      JOIN price_entries p ON v.id = p.id
      WHERE v.embedding MATCH ?
        AND k = 10
      ORDER BY distance
    `);
    
    const rows = stmt.all(new Float32Array(queryEmbedding)) as any[];
    
    return rows.map(row => ({
      ...row,
      timestamp: new Date(row.timestamp),
      isTrusted: Boolean(row.isTrusted)
    })) as PriceEntry[];
  } catch (error) {
    console.error("Vector search failed:", error);
    return [];
  }
}

function wordWrap(text: string, width: number = 80): string {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > width) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  lines.push(currentLine.trim());
  return lines.join('\n');
}

export interface WebSearchResult {
  title: string;
  body: string;
  source: string;
  url: string;
  date: string;
  price?: string;
}

async function extractPricesWithAI(query: string, results: { title: string; body: string }[]): Promise<(string | undefined)[]> {
  try {
    const apiUrl = process.env.AI_SERVICE_URL || "https://api.openai.com/v1/chat/completions";
    const apiKey = process.env.AI_CLIENT_API_KEY;

    if (!apiKey) return new Array(results.length).fill(undefined);

    const itemsStr = results.map((r, i) => `[${i}] Title: ${r.title}\nSnippet: ${r.body}`).join('\n\n');

    const systemPrompt = `You are a data extraction engine.
Goal: Extract the exact price of the item '${query}' from the provided search snippets.

Rules:
1. Extract ONLY the numeric price with currency symbol (e.g., ₹24,999, $500).
2. Clean up joined or doubled prices (e.g., if you see '₹34,774₹34,774', return '₹34,774').
3. Ignore 'Save ₹...', '...off', 'EMI start at...', 'Delivery...', 'Exchange up to...', 'Price, product page'.
4. CRITICAL: Ignore prices mentioned as 'Under ₹...', 'Below ₹...', 'Budget ₹...' in titles. These are category labels, not the actual product price.
5. If the item is 'Currently unavailable', 'Sold out', or no price is listed, return null.
6. If multiple prices exist, pick the main selling price (usually the largest number that isn't a crossed-out MRP).

Output JSON format:
{
  "prices": [
    "₹24,999",
    null,
    "₹25,500"
  ]
}
The array order MUST match the input indices.`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.AI_SERVICE_URL ? "meta/llama-3.1-8b-instruct" : "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: itemsStr }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) return new Array(results.length).fill(undefined);

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return parsed.prices;
  } catch (e) {
    console.error("AI Price Extraction Error:", e);
    return new Array(results.length).fill(undefined);
  }
}

async function getWebMarketPrices(query: string, deepSearch: boolean = false): Promise<WebSearchResult[]> {
  try {
    const ddgs = new DDGS();
    
    // 1. Get Trusted Sources
    const sources = db.prepare('SELECT url FROM trusted_sources WHERE isActive = 1').all() as { url: string }[];
    
    // 2. Define Search Promises
    const searchPromises: Promise<any[]>[] = [];
    
    // A. Priority Search (Trusted Sources)
    if (sources.length > 0) {
      const sourceQuery = ` (${sources.map(s => `site:${new URL(s.url).hostname}`).join(' OR ')})`;
      const trustedKeywords = `${query} current market price India${sourceQuery}`;
      searchPromises.push(ddgs.text({ keywords: trustedKeywords }));
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    // B. General Web Search (Broader Context)
    const generalKeywords = `${query} price India`;
    searchPromises.push(ddgs.text({ keywords: generalKeywords }));

    // 3. Execute Searches in Parallel
    const [trustedResults, generalResults] = await Promise.all(searchPromises);
    
    // 4. Combine & Deduplicate (Trusted First)
    const combinedRawResults = [...(trustedResults || []), ...(generalResults || [])];
    
    if (combinedRawResults.length === 0) return [];
    
    const validResults = combinedRawResults.filter(r => r.href && r.href.startsWith('http'));

    const seenUrls = new Set();
    const uniqueResults = validResults.filter(r => {
      if (seenUrls.has(r.href)) return false;
      seenUrls.add(r.href);
      return true;
    });

    const currentDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    // 5. Process Results (Deep Search or Standard)
    if (!deepSearch) {
      // Create a map to track domains and ensure diversity
      const domainCount = new Map<string, number>();
      
      const mixedResults = uniqueResults.reduce((acc, r) => {
        let hostname = 'Source';
        try { hostname = new URL(r.href).hostname.replace('www.', ''); } catch (e) {}
        
        // Limit to 2 results per domain to ensure variety ("extra sources")
        const currentCount = domainCount.get(hostname) || 0;
        if (currentCount >= 2) return acc;
        
        domainCount.set(hostname, currentCount + 1);
        
        acc.push({
          title: r.title,
          body: r.body.replace(/\s\s+/g, ' ').trim(),
          source: hostname,
          url: r.href,
          date: currentDate,
          price: undefined // To be filled by AI
        });
        return acc;
      }, [] as WebSearchResult[]);

      const finalResults = mixedResults.slice(0, 16); // Fetch more results
      const extractedPrices = await extractPricesWithAI(query, finalResults);
      
      return finalResults.map((r: WebSearchResult, i: number) => ({
        ...r,
        price: extractedPrices[i] || undefined
      }));
    }

    // Deep Search Logic
    const topResults = uniqueResults.slice(0, 8); // Fetch more for deep search too
    const detailedContents = await Promise.all(topResults.map(async (r) => {
      let hostname = 'Source';
      try { hostname = new URL(r.href).hostname.replace('www.', ''); } catch (e) {}
      
      try {
        const readerUrl = `https://r.jina.ai/${r.href}`;
        const response = await fetch(readerUrl);
        let content = !response.ok ? r.body : await response.text();
        
        content = content
          .replace(/\s\s+/g, ' ')
          .replace(/\n\s*\n/g, ' ')
          .trim()
          .substring(0, 300);

        return {
          title: r.title,
          body: content + "...",
          source: hostname,
          url: r.href,
          date: currentDate,
          price: undefined
        };
      } catch {
        return {
          title: r.title,
          body: r.body.replace(/\s\s+/g, ' ').trim(),
          source: hostname,
          url: r.href,
          date: currentDate,
          price: undefined
        };
      }
    }));

    const extractedPrices = await extractPricesWithAI(query, detailedContents);
    return detailedContents.map((r, i) => ({
      ...r,
      price: extractedPrices[i] || undefined
    }));
    
    return detailedContents;
  } catch (error) {
    console.error("Web search error:", error);
    return [];
  }
}

export interface AnalysisResult {
  expectedPriceRange: string;
  verdict: "Likely Underpriced" | "Fair Deal" | "Slightly High" | "Likely Overpriced" | "Analysis Pending";
  confidence: "Low" | "Medium" | "High";
  explanation: string;
}

export async function processPriceRequest(query: string, deepSearch: boolean = false) {
  const startTime = Date.now();
  let targetPrice = 0;
  
  try {
    // Check if query is a direct URL
    const isUrl = /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(query.trim());
    
    if (isUrl) {
      const url = query.trim();
      let hostname = new URL(url).hostname.replace('www.', '');
      
      try {
        const readerUrl = `https://r.jina.ai/${url}`;
        const response = await fetch(readerUrl);
        let content = await response.text();
        
        const titleMatch = content.match(/^Title: (.*)$/m);
        const title = titleMatch ? titleMatch[1] : hostname;
        
        const snippet = content
          .replace(/\s\s+/g, ' ')
          .replace(/\n\s*\n/g, ' ')
          .trim()
          .substring(0, 500);

        const extractedPrices = await extractPricesWithAI(title, [{ title, body: snippet }]);
        const price = extractedPrices[0];

        const webResult: WebSearchResult = {
          title,
          body: snippet + "...",
          source: hostname,
          url,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          price
        };

        return {
          symbol: hostname.toUpperCase(),
          price: 0,
          analysis: {
            expectedPriceRange: price || "N/A",
            verdict: "Analysis Pending",
            confidence: "Medium",
            explanation: `Direct analysis of ${hostname}. ${price ? `Detected price: ${price}.` : "No price detected on this page."}`
          } as AnalysisResult,
          webData: [webResult]
        };
      } catch (e) {
        console.error("Direct URL fetch failed:", e);
      }
    }

    const history = await searchSimilarEntries(query);
    
    // Extract Item Name early
    const priceMatch = query.match(/(?:₹|Rs\.?|rs\.?|\$|for|at)\s?(\d+(?:,\d+)*)/i) || query.match(/(\d+(?:,\d+)*)\s?(?:rs|rupees|bucks)/i);
    const locationMatch = query.match(/(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const item = priceMatch ? query.replace(priceMatch[0], '').replace(locationMatch ? locationMatch[0] : '', '').trim() : query;

    // Use item name for cleaner web search context
    const webData = await getWebMarketPrices(item, deepSearch);
    
    let extractedPrice: number | null = null;
    if (priceMatch) {
      const val = priceMatch[1];
      extractedPrice = parseInt(val.replace(/,/g, ''));
    }
    
    if (extractedPrice === null) {
      return {
        symbol: query.toUpperCase(),
        price: 0,
        analysis: {
          expectedPriceRange: "N/A",
          verdict: "Analysis Pending",
          confidence: "Low",
          explanation: "I found some information, but to give you a precise verdict, please tell me what price you are getting for this product."
        } as AnalysisResult,
        webData: webData
      };
    }

    targetPrice = extractedPrice;

    if (item.length > 2) {
      const location = locationMatch ? locationMatch[1] : "Unknown";
      await addEntry({
        item: item,
        location: location,
        price: extractedPrice,
        contributorId: 'auto-logged'
      });
    }

    const analysis = await getExpertOpinionAction(item, targetPrice, history, webData);
    
    const responseTime = Date.now() - startTime;
    
    db.prepare(`
      INSERT INTO logs (query, price_result, deep_search, status, response_time)
      VALUES (?, ?, ?, ?, ?)
    `).run(query, targetPrice, deepSearch ? 1 : 0, 'success', responseTime);

    let confidenceScore = 60; // Lower base score
    if (history.length > 0) confidenceScore += Math.min(history.length * 5, 20); // History matters
    
    // Web data only boosts confidence if it has PRICE data
    if (webData && webData.length > 0) {
      const entriesWithPrice = webData.filter(w => w.price).length;
      confidenceScore += (entriesWithPrice * 3); // 3 points per valid price source
    }
    
    if (deepSearch) confidenceScore += 5;
    
    confidenceScore = Math.min(confidenceScore, 95); // Cap at 95% unless perfect

    // Mask the contributorId for privacy
    const safeHistory = history.map(h => ({
      ...h,
      contributorId: undefined, // Remove ID
      location: h.location || "Unknown Location"
    })).slice(0, 5); // Limit to 5 entries

    return {
      symbol: query.toUpperCase(),
      price: targetPrice,
      analysis: analysis,
      webData: webData,
      confidenceScore: confidenceScore,
      relatedEntries: safeHistory
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    db.prepare(`
      INSERT INTO logs (query, price_result, deep_search, status, response_time)
      VALUES (?, ?, ?, ?, ?)
    `).run(query, 0, deepSearch ? 1 : 0, 'error', responseTime);
    throw error;
  }
}

export async function getLogs() {
  const stmt = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100');
  return stmt.all() as { id: number, query: string, price_result: number, deep_search: number, status: string, response_time: number, timestamp: string }[];
}

export async function getStats() {
  const totalQueries = db.prepare('SELECT COUNT(*) as count FROM logs').get() as { count: number };
  const avgResponseTime = db.prepare('SELECT AVG(response_time) as avg FROM logs').get() as { avg: number };
  const successRate = db.prepare("SELECT (COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*)) as rate FROM logs").get() as { rate: number };
  
  const dailyQueries = db.prepare(`
    SELECT date(timestamp) as date, COUNT(*) as count 
    FROM logs 
    GROUP BY date(timestamp) 
    ORDER BY date DESC 
    LIMIT 7
  `).all() as { date: string, count: number }[];

  return {
    totalQueries: totalQueries.count,
    avgResponseTime: Math.round(avgResponseTime.avg || 0),
    successRate: Math.round(successRate.rate || 0),
    dailyQueries: dailyQueries.reverse()
  };
}

export async function getExpertOpinionAction(item: string, price: number, history: PriceEntry[], webData: WebSearchResult[] = []): Promise<AnalysisResult> {
  try {
    const apiUrl = process.env.AI_SERVICE_URL || "https://api.openai.com/v1/chat/completions";
    const apiKey = process.env.AI_CLIENT_API_KEY;

    if (!apiKey) {
      throw new Error("API Key missing");
    }

    const systemPrompt = `You are a price transparency expert. 
    Goal: Evaluate if a user's proposed price is a good deal based on historical data.
    
    CRITICAL LOGIC:
    - If User's Proposed Price is HIGHER than the Market/Historical Price, it is OVERPRICED.
    - If User's Proposed Price is LOWER than the Market/Historical Price, it is UNDERPRICED.
    - If they are similar, it is a FAIR DEAL.

    STRICT JSON OUTPUT FORMAT ONLY:
    {
      "expectedPriceRange": "₹X – ₹Y",
      "verdict": "Likely Underpriced" | "Fair Deal" | "Slightly High" | "Likely Overpriced",
      "confidence": "Low" | "Medium" | "High",
      "explanation": "1 short sentence explaining WHY."
    }`;

    const webContextStr = webData.map(w => `${w.title} (${w.price || 'N/A'})`).join('; ');
    const userContent = `Item: ${item}, Proposed Price: ${price}. Historical data: ${JSON.stringify(history.slice(0, 5))}. Web Market Context: ${webContextStr}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.AI_SERVICE_URL ? "meta/llama-3.1-8b-instruct" : "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userContent
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    return JSON.parse(data.choices[0].message.content) as AnalysisResult;
  } catch (error) {
    console.error("AI Error:", error);
    const confidence = history.length > 5 ? "High" : history.length > 0 ? "Medium" : "Low";
    return {
      expectedPriceRange: `₹${Math.round(price * 0.9)} – ₹${Math.round(price * 1.1)}`,
      verdict: "Analysis Pending",
      confidence: confidence as any,
      explanation: `Based on ${history.length} similar market entries in our database.`
    };
  }
}

export async function adminLogin(formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const secret = new TextEncoder().encode(process.env.ADMIN_PASSWORD);
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(secret);

    (await cookies()).set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7200,
    });

    return { success: true };
  }

  return { success: false, error: 'Invalid credentials' };
}

export async function deleteEntry(id: string) {
  db.prepare('DELETE FROM price_entries WHERE id = ?').run(id);
  db.prepare('DELETE FROM vec_items WHERE id = ?').run(id);
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function getTrustedSources() {
  return db.prepare('SELECT * FROM trusted_sources ORDER BY category ASC, name ASC').all() as any[];
}

export async function addTrustedSource(name: string, url: string, category: string) {
  try {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim().toLowerCase();
    const trimmedCategory = category.trim();

    if (!trimmedName || !trimmedUrl || !trimmedCategory) {
      return { success: false, error: "All fields are required" };
    }

    // Ensure URL is valid
    try {
      new URL(trimmedUrl);
    } catch {
      return { success: false, error: "Invalid URL format" };
    }

    // Check for duplicates
    const existing = db.prepare('SELECT id FROM trusted_sources WHERE url = ?').get(trimmedUrl);
    if (existing) {
      return { success: false, error: "A source with this URL already exists" };
    }

    const stmt = db.prepare('INSERT INTO trusted_sources (name, url, category, isActive) VALUES (?, ?, ?, ?)');
    stmt.run(trimmedName, trimmedUrl, trimmedCategory, 1);
    
    revalidatePath('/admin/sources');
    return { success: true };
  } catch (error: any) {
    console.error("Add source error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTrustedSource(id: number) {
  try {
    db.prepare('DELETE FROM trusted_sources WHERE id = ?').run(id);
    revalidatePath('/admin/sources');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleSourceStatus(id: number, isActive: boolean) {
  try {
    db.prepare('UPDATE trusted_sources SET isActive = ? WHERE id = ?').run(isActive ? 1 : 0, id);
    revalidatePath('/admin/sources');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reportUnparsedUrl(url: string, title: string, query: string) {
  try {
    db.prepare('INSERT INTO reported_urls (url, title, query) VALUES (?, ?, ?)').run(url, title, query);
    return { success: true };
  } catch (error: any) {
    console.error("Report URL error:", error);
    return { success: false, error: error.message };
  }
}

export async function getReportedUrls() {
  return db.prepare('SELECT * FROM reported_urls ORDER BY timestamp DESC').all() as any[];
}

export async function deleteReportedUrl(id: number) {
  try {
    db.prepare('DELETE FROM reported_urls WHERE id = ?').run(id);
    revalidatePath('/admin/reports');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminLogout() {
  (await cookies()).delete('admin_token');
  redirect('/admin/login');
}