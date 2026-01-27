"use server";

import db, { getEmbedding } from './db';
import { PriceEntry } from './priceEngine';
import { DDGS } from '@phukon/duckduckgo-search';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
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
        
        // Extract Price
        const priceMatch = r.title.match(/(?:₹|Rs\.?|INR)\s?(\d{1,3}(?:,\d{2,3})*)/i) || 
                           r.body.match(/(?:₹|Rs\.?|INR)\s?(\d{1,3}(?:,\d{2,3})*)/i);
        const price = priceMatch ? `₹${priceMatch[1]}` : undefined;

        acc.push({
          title: r.title,
          body: r.body.replace(/\s\s+/g, ' ').trim(),
          source: hostname,
          url: r.href,
          date: currentDate,
          price: price
        });
        return acc;
      }, [] as WebSearchResult[]);

      return mixedResults.slice(0, 8);
    }

    // Deep Search Logic
    const topResults = uniqueResults.slice(0, 4);
    const detailedContents = await Promise.all(topResults.map(async (r) => {
      let hostname = 'Source';
      try { hostname = new URL(r.href).hostname.replace('www.', ''); } catch (e) {}
      
      let price = undefined;
      // Initial price check on title/snippet before deep fetch
      const initialMatch = r.title.match(/(?:₹|Rs\.?|INR)\s?(\d{1,3}(?:,\d{2,3})*)/i) || 
                           r.body.match(/(?:₹|Rs\.?|INR)\s?(\d{1,3}(?:,\d{2,3})*)/i);
      if (initialMatch) price = `₹${initialMatch[1]}`;

      try {
        const readerUrl = `https://r.jina.ai/${r.href}`;
        const response = await fetch(readerUrl);
        let content = !response.ok ? r.body : await response.text();
        
        // Try to extract price from full content if not found yet
        if (!price) {
           const contentMatch = content.match(/(?:₹|Rs\.?|INR)\s?(\d{1,3}(?:,\d{2,3})*)/i);
           if (contentMatch) price = `₹${contentMatch[1]}`;
        }

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
          price: price
        };
      } catch {
        return {
          title: r.title,
          body: r.body.replace(/\s\s+/g, ' ').trim(),
          source: hostname,
          url: r.href,
          date: currentDate,
          price: price
        };
      }
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
    const history = await searchSimilarEntries(query);
    const webData = await getWebMarketPrices(query, deepSearch);
    
    const priceMatch = query.match(/(?:₹|Rs\.?|rs\.?|\$|for|at)\s?(\d+(?:,\d+)*)/i) || query.match(/(\d+(?:,\d+)*)\s?(?:rs|rupees|bucks)/i);
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

    if (extractedPrice !== null && priceMatch) {
      const locationMatch = query.match(/(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      const location = locationMatch ? locationMatch[1] : "Unknown";
      const item = query.replace(priceMatch[0], '').replace(locationMatch ? locationMatch[0] : '', '').trim();
      
      if (item.length > 2) {
        await addEntry({
          item: item,
          location: location,
          price: extractedPrice,
          contributorId: 'auto-logged'
        });
      }
    }

    const analysis = await getExpertOpinionAction(query, targetPrice, history, webData);
    
    const responseTime = Date.now() - startTime;
    
    db.prepare(`
      INSERT INTO logs (query, price_result, deep_search, status, response_time)
      VALUES (?, ?, ?, ?, ?)
    `).run(query, targetPrice, deepSearch ? 1 : 0, 'success', responseTime);

    let confidenceScore = 70;
    if (history.length > 0) confidenceScore += Math.min(history.length * 5, 15);
    if (webData && webData.length > 0) confidenceScore += 10;
    if (deepSearch) confidenceScore += 4;
    confidenceScore = Math.min(confidenceScore, 99);

    return {
      symbol: query.toUpperCase(),
      price: targetPrice,
      analysis: analysis,
      webData: webData,
      confidenceScore: confidenceScore
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