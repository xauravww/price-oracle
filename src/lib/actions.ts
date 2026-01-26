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

async function getWebMarketPrices(query: string, deepSearch: boolean = false): Promise<string> {
  try {
    const ddgs = new DDGS();
    const results = await ddgs.text({ keywords: `${query} price in India` });
    if (!results || results.length === 0) return "No web data found.";
    
    if (!deepSearch) {
      return results.slice(0, 3).map(r => `${r.title}: ${r.body}`).join('\n');
    }

    const topResults = results.slice(0, 2);
    const detailedContents = await Promise.all(topResults.map(async (r) => {
      try {
        const readerUrl = `https://r.jina.ai/${r.href}`;
        const response = await fetch(readerUrl);
        if (!response.ok) return `${r.title}: ${r.body}`;
        const text = await response.text();
        return `Source: ${r.title}\nURL: ${r.href}\nContent: ${text.substring(0, 2000)}...`;
      } catch {
        return `${r.title}: ${r.body}`;
      }
    }));
    
    return detailedContents.join('\n\n---\n\n');
  } catch (error) {
    console.error("Web search error:", error);
    return "Web search failed.";
  }
}

export async function processPriceRequest(query: string, deepSearch: boolean = false, image?: string) {
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
        analysis: "I found some information, but to give you a precise verdict, please tell me what price you are getting for this product (e.g., 'iPhone 15 for 60000'). Location is optional but helpful!",
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

    const analysis = await getExpertOpinionAction(query, targetPrice, history, webData, image);
    
    const responseTime = Date.now() - startTime;
    
    db.prepare(`
      INSERT INTO logs (query, price_result, deep_search, status, response_time)
      VALUES (?, ?, ?, ?, ?)
    `).run(query, targetPrice, deepSearch ? 1 : 0, 'success', responseTime);

    let confidenceScore = 70;
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

export async function getExpertOpinionAction(item: string, price: number, history: PriceEntry[], webData: string = '', image?: string): Promise<string> {
  try {
    const apiUrl = process.env.AI_SERVICE_URL || "https://api.openai.com/v1/chat/completions";
    const apiKey = process.env.AI_CLIENT_API_KEY;

    if (!apiKey) {
      throw new Error("API Key missing");
    }

    const systemPrompt = `You are a price transparency expert. 
    Goal: Evaluate if a user's proposed price is a good deal based on historical data.
    ${image ? "An image of the product has been provided. Use it to identify the product and its condition if possible." : ""}
    
    CRITICAL LOGIC:
    - If User's Proposed Price is HIGHER than the Market/Historical Price, it is OVERPRICED.
    - If User's Proposed Price is LOWER than the Market/Historical Price, it is UNDERPRICED.
    - If they are similar, it is a FAIR DEAL.

    STRICT OUTPUT FORMAT:
    Expected Price Range: ₹X – ₹Y
    Verdict: Likely Underpriced / Fair Deal / Slightly High / Likely Overpriced
    Confidence: Low / Medium / High
    Explanation: (1 line explanation explaining WHY based on the price difference)`;

    const userContent: any = image ? [
      { type: "text", text: `Item: ${item}, Proposed Price: ${price}. Historical data: ${JSON.stringify(history.slice(0, 5))}. Web Market Context: ${webData}` },
      { type: "image_url", image_url: { url: image } }
    ] : `Item: ${item}, Proposed Price: ${price}. Historical data: ${JSON.stringify(history.slice(0, 5))}. Web Market Context: ${webData}`;

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
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText.substring(0, 100)}`);
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
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