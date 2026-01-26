
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
  
  const totalCount = (db.prepare('SELECT COUNT(*) as count FROM price_entries').get() as any).count;
  
  const entries = rows.map(row => ({
    ...row,
    timestamp: new Date(row.timestamp),
    isTrusted: Boolean(row.isTrusted)
  }));

  return {
    entries,
    totalPages: Math.ceil(totalCount / limit),
    totalCount
  };
}

export async function addEntry(entry: Omit<PriceEntry, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'isTrusted'>) {
  const id = Math.random().toString(36).substr(2, 9);
  
  // 1. Save to main table
  const stmt = db.prepare(`
    INSERT INTO price_entries (id, item, location, price, contributorId)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, entry.item, entry.location, entry.price, entry.contributorId);

  // 2. Generate and save embedding
  try {
    const embedding = await getEmbedding(entry.item);
    const vecStmt = db.prepare(`
      INSERT INTO vec_items (id, embedding)
      VALUES (?, ?)
    `);
    // sqlite-vec expects Float32Array for embeddings
    vecStmt.run(id, new Float32Array(embedding));
  } catch (e) {
    console.error("Failed to save embedding:", e);
  }

  try {
    revalidatePath('/');
  } catch (e) {
    // Ignore revalidation error in non-Next.js environments
  }
}

export async function searchSimilarEntries(query: string): Promise<PriceEntry[]> {
  try {
    const queryEmbedding = await getEmbedding(query);
    
    // Search for top 10 similar items using vector similarity
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
    }));
  } catch (e) {
    console.error("Vector search failed:", e);
    return [];
  }
}

async function getWebMarketPrices(query: string, deepSearch: boolean = false): Promise<string> {
  try {
    const ddgs = new DDGS();
    const results = await ddgs.text({ keywords: `${query} price in India` });
    if (!results || results.length === 0) return "No web data found.";
    
    if (!deepSearch) {
      return results.slice(0, 3).map(r => `${r.title}: ${r.body}`).join('\n');
    }

    // Get top 2 URLs to read deeply
    const topResults = results.slice(0, 2);
    const detailedContents = await Promise.all(topResults.map(async (r) => {
      try {
        const readerUrl = `https://r.jina.ai/${r.href}`;
        const response = await fetch(readerUrl);
        if (!response.ok) return `${r.title}: ${r.body}`;
        const text = await response.text();
        // Return a cleaned snippet of the page content (first 2000 chars)
        return `Source: ${r.title}\nURL: ${r.href}\nContent: ${text.substring(0, 2000)}...`;
      } catch (e) {
        return `${r.title}: ${r.body}`;
      }
    }));
    
    return detailedContents.join('\n\n---\n\n');
  } catch (error) {
    console.error("Web search error:", error);
    return "Web search failed.";
  }
}

export async function processPriceRequest(query: string, deepSearch: boolean = false) {
  const startTime = Date.now();
  let status = 'success';
  let targetPrice = 0;
  
  try {
    const history = await searchSimilarEntries(query);
    const webData = await getWebMarketPrices(query, deepSearch);
    
    const priceMatch = query.match(/(?:₹|Rs\.?|rs\.?|\$|for|at)\s?(\d+(?:,\d+)*)/i) || query.match(/(\d+(?:,\d+)*)\s?(?:rs|rupees|bucks)/i);
    let extractedPrice = null;
    if (priceMatch) {
      const val = priceMatch[1];
      extractedPrice = parseInt(val.replace(/,/g, ''));
    }
    
    if (extractedPrice === null) {
      return {
        symbol: query.toUpperCase(),
        price: 0,
        analysis: "I found some information, but to give you a precise verdict, please tell me what price you are getting for this product (e.g., 'iPhone 15 for 60000'). Location is optional but helpful!",
        webData: webData
      };
    }

    targetPrice = extractedPrice;

    // Auto-contribute to DB if price is found in query
    if (extractedPrice !== null) {
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

    const analysis = await getExpertOpinionAction(query, targetPrice, history, 'general', webData);
    
    const responseTime = Date.now() - startTime;
    
    // Log the request
    db.prepare(`
      INSERT INTO logs (query, price_result, deep_search, status, response_time)
      VALUES (?, ?, ?, ?, ?)
    `).run(query, targetPrice, deepSearch ? 1 : 0, 'success', responseTime);

    // Calculate dynamic confidence score
    let confidenceScore = 70; // Base confidence
    if (history.length > 0) confidenceScore += Math.min(history.length * 5, 15);
    if (webData && webData.length > 100) confidenceScore += 10;
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
  return stmt.all() as any[];
}

export async function getStats() {
  const totalQueries = db.prepare('SELECT COUNT(*) as count FROM logs').get() as any;
  const avgResponseTime = db.prepare('SELECT AVG(response_time) as avg FROM logs').get() as any;
  const successRate = db.prepare("SELECT (COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*)) as rate FROM logs").get() as any;
  
  // Get daily query counts for the last 7 days
  const dailyQueries = db.prepare(`
    SELECT date(timestamp) as date, COUNT(*) as count 
    FROM logs 
    GROUP BY date(timestamp) 
    ORDER BY date DESC 
    LIMIT 7
  `).all() as any[];

  return {
    totalQueries: totalQueries.count,
    avgResponseTime: Math.round(avgResponseTime.avg || 0),
    successRate: Math.round(successRate.rate || 0),
    dailyQueries: dailyQueries.reverse()
  };
}



export async function getExpertOpinionAction(item: string, price: number, history: PriceEntry[], category: string = 'general', webData: string = ''): Promise<string> {
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

    STRICT OUTPUT FORMAT:
    Expected Price Range: ₹X – ₹Y
    Verdict: Likely Underpriced / Fair Deal / Slightly High / Likely Overpriced
    Confidence: Low / Medium / High
    Explanation: (1 line explanation explaining WHY based on the price difference)`;

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
            content: `Item: ${item}, Proposed Price: ${price}. 
            Historical data: ${JSON.stringify(history.slice(0, 5))}.
            Web Market Context: ${webData}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("AI Error:", error);
    // Return a clean fallback instead of showing the error to the user
    const confidence = history.length > 5 ? "High" : history.length > 0 ? "Medium" : "Low";
    return `Expected Price Range: ₹${Math.round(price * 0.9)} – ₹${Math.round(price * 1.1)}
Verdict: Analysis Pending
Confidence: ${confidence}
Explanation: Based on ${history.length} similar market entries in our database.`;
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
      maxAge: 7200, // 2 hours
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
