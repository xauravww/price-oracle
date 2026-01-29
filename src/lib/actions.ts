"use server";

import prisma, { getEmbedding } from './db';
import { PriceEntry } from './priceEngine';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT } from 'jose';

export async function getEntries(page: number = 1, limit: number = 10): Promise<{ entries: PriceEntry[], totalPages: number, totalCount: number }> {
  const offset = (page - 1) * limit;

  const [entries, totalCount] = await Promise.all([
    prisma.priceEntry.findMany({
      orderBy: { timestamp: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.priceEntry.count(),
  ]);

  return {
    entries: entries as PriceEntry[],
    totalPages: Math.ceil(totalCount / limit),
    totalCount
  };
}

export async function addEntry(entry: Omit<PriceEntry, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'isTrusted'>) {
  const id = Math.random().toString(36).substr(2, 9);

  await prisma.priceEntry.create({
    data: {
      id,
      item: entry.item,
      location: entry.location,
      price: entry.price,
      contributorId: entry.contributorId,
    },
  });

  try {
    const embedding = await getEmbedding(entry.item);
    const embeddingString = `[${embedding.join(',')}]`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO vec_items (id, embedding) VALUES ($1, $2::vector)`,
      id,
      embeddingString
    );
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
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // Using pgvector cosine distance operator <=>
    const results = (await prisma.$queryRawUnsafe(`
      SELECT 
        p.id,
        p.item,
        p.location,
        p.price,
        p.timestamp,
        p.upvotes,
        p.downvotes,
        p."isTrusted",
        p."contributorId",
        (v.embedding <=> $1::vector) as distance
      FROM vec_items v
      JOIN price_entries p ON v.id = p.id
      ORDER BY distance
      LIMIT 10
    `, embeddingString)) as any[];

    return results.map((row: any) => ({
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

/**
 * Robustly parses JSON from AI response, handling cases where the model
 * might include conversational filler or markdown blocks.
 */
function parseAIResponse<T>(content: string): T {
  try {
    // 1. Try direct parse
    return JSON.parse(content) as T;
  } catch (e) {
    // 2. Try to find JSON within markdown code blocks or just between braces
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
      content.match(/```([\s\S]*?)```/) ||
      content.match(/(\{[\s\S]*\})/);

    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]) as T;
      } catch (innerError) {
        // Fallback for the third regex match which captures the whole curly brace block
        if (jsonMatch[0]) {
          try {
            return JSON.parse(jsonMatch[0]) as T;
          } catch (thirdError) {
            throw new Error(`Failed to parse AI response: ${content.substring(0, 100)}...`);
          }
        }
        throw innerError;
      }
    }
    throw e;
  }
}

export interface WebSearchResult {
  title: string;
  body: string;
  source: string;
  url: string;
  date: string;
  price?: string;
}

interface ExtractionResult {
  price: string | null;
  suggestedUrl: string | null;
}

async function extractPricesWithAI(query: string, results: { title: string; body: string }[]): Promise<ExtractionResult[]> {
  try {
    const apiUrl = process.env.AI_SERVICE_URL || "https://api.openai.com/v1/chat/completions";
    const apiKey = process.env.AI_CLIENT_API_KEY;

    if (!apiKey) return new Array(results.length).fill({ price: null, suggestedUrl: null });

    const itemsStr = results.map((r, i) => `[${i}] Title: ${r.title}\nSnippet: ${r.body}`).join('\n\n');

    const systemPrompt = `You are a data extraction engine.
Goal: Extract the exact price of the item '${query}' from search snippets.

Rules:
1. price: Extract ONLY the numeric price with currency (e.g., ₹24,999).
2. Clean up joined or doubled prices (e.g., if you see '₹34,774₹34,774', return '₹34,774').
3. suggestedUrl: If the snippet looks like a SEARCH RESULT or LISTING page (e.g. multiple items) and NO specific price is found, look for a 'Direct Product Link' for the item.
4. Ignore 'Save ₹...', '...off', 'EMI start at...', 'Delivery...', 'Exchange up to...', 'Price, product page'.
5. Ignore category labels like 'Under ₹16,000'.
6. If multiple prices exist on a listing, return null for price but provide the 'suggestedUrl' of the most relevant product.

CRITICAL: Return ONLY a valid JSON object. No conversational text, no pre-amble, no markdown formatting unless it is part of the JSON values.

Output JSON format:
{
  "results": [
    { "price": "₹24,999", "suggestedUrl": null },
    { "price": null, "suggestedUrl": "https://amazon.in/direct-link-to-product" }
  ]
}
The array order MUST match input.`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: itemsStr }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) return new Array(results.length).fill({ price: null, suggestedUrl: null });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    const parsed = parseAIResponse<{ results: ExtractionResult[] }>(content);
    return parsed.results;
  } catch (e) {
    console.error("AI Price Extraction Error:", e);
    return new Array(results.length).fill({ price: null, suggestedUrl: null });
  }
}

async function getWebMarketPrices(query: string, deepSearch: boolean = false): Promise<WebSearchResult[]> {
  try {
    // Import the new search service
    const { performWebSearch } = await import('./searchService');

    // 1. Get Trusted Sources
    const sources = await prisma.trustedSource.findMany({
      where: { isActive: true },
      select: { url: true },
    });

    // 2. Define Search Promises
    const searchPromises: Promise<any[]>[] = [];

    // A. Priority Search (Trusted Sources)
    if (sources.length > 0) {
      const sourceQuery = ` (${sources.map((s: any) => `site:${new URL(s.url).hostname}`).join(' OR ')})`;
      const trustedKeywords = `${query} current market price India${sourceQuery}`;
      searchPromises.push(performWebSearch(trustedKeywords));
    } else {
      searchPromises.push(Promise.resolve([]));
    }

    // B. General Web Search (Broader Context)
    const generalKeywords = `${query} price India`;
    searchPromises.push(performWebSearch(generalKeywords));

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
        try { hostname = new URL(r.href).hostname.replace('www.', ''); } catch (e) { }

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
      const extractions = await extractPricesWithAI(query, finalResults);

      // --- SMART FALLBACK LOGIC ---
      // If we missed prices for important domains, do a quick fetch
      const highValueDomains = ['flipkart', 'amazon', 'reliance', 'croma', 'tatacliq', 'jiomart'];

      const resultsWithFallback = await Promise.all(finalResults.map(async (r: WebSearchResult, i: number) => {
        let price = extractions[i]?.price || undefined;
        let suggestedUrl = extractions[i]?.suggestedUrl;

        // Condition: No price found AND (High Value Domain OR AI suggested a better link)
        const isHighValue = highValueDomains.some(d => r.source.toLowerCase().includes(d));

        if (!price && (isHighValue || suggestedUrl)) {
          try {
            // Prefer suggested URL if available, else original
            const targetUrl = (suggestedUrl && suggestedUrl.startsWith('http')) ? suggestedUrl : r.url;

            // Quick fetch using Jina
            const readerUrl = `https://r.jina.ai/${targetUrl}`;
            const response = await fetch(readerUrl, { signal: AbortSignal.timeout(4000) }); // 4s timeout

            if (response.ok) {
              const content = await response.text();
              const cleanContent = content.replace(/\s\s+/g, ' ').substring(0, 1500); // 1.5k chars context

              const fallbackExtraction = await extractPricesWithAI(query, [{
                title: r.title,
                body: cleanContent
              }]);

              if (fallbackExtraction[0]?.price) {
                price = fallbackExtraction[0].price;
              }
            }
          } catch (e) {
            // Fallback failed, stick to original (null)
          }
        }

        return {
          ...r,
          price: price
        };
      }));

      return resultsWithFallback;
    }

    // Deep Search Logic
    const topResults = uniqueResults.slice(0, 8); // Fetch more for deep search too
    let detailedContents = await Promise.all(topResults.map(async (r) => {
      let hostname = 'Source';
      try { hostname = new URL(r.href).hostname.replace('www.', ''); } catch (e) { }

      try {
        const readerUrl = `https://r.jina.ai/${r.href}`;
        const response = await fetch(readerUrl);
        let content = !response.ok ? r.body : await response.text();

        content = content
          .replace(/\s\s+/g, ' ')
          .replace(/\n\s*\n/g, ' ')
          .trim()
          .substring(0, 800); // More context for deep search

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

    const extractions = await extractPricesWithAI(query, detailedContents);

    // DRILL DOWN LOGIC
    const finalDeepResults = await Promise.all(detailedContents.map(async (r, i) => {
      const ext = extractions[i];
      if (!ext.price && ext.suggestedUrl) {
        // AI found a better link on a listing page, drill down!
        try {
          const drillDownUrl = ext.suggestedUrl.startsWith('http') ? ext.suggestedUrl : new URL(ext.suggestedUrl, r.url).href;
          const response = await fetch(`https://r.jina.ai/${drillDownUrl}`);
          if (response.ok) {
            const content = await response.text();
            const deepExtractions = await extractPricesWithAI(query, [{
              title: r.title,
              body: content.substring(0, 1000)
            }]);

            return {
              ...r,
              url: drillDownUrl,
              body: content.substring(0, 300) + "...",
              price: deepExtractions[0]?.price || undefined
            };
          }
        } catch (err) {
          console.error("Drill down failed:", err);
        }
      }
      return {
        ...r,
        price: ext?.price || undefined
      };
    }));

    return finalDeepResults;
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
        const price = extractedPrices[0]?.price || undefined;

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

    // Extract Item Name and Price with support for k, m suffixes
    const priceWithSuffixMatch = query.match(/(?:₹|Rs\.?|rs\.?|\$|for|at)\s?(\d+(?:\.\d+)?)\s?(k|K|m|M)\b/i) ||
      query.match(/(\d+(?:\.\d+)?)\s?(k|K|m|M)\s?(?:rs|rupees|bucks|inr)/i);

    const standardPriceMatch = query.match(/(?:₹|Rs\.?|rs\.?|\$|for|at)\s?(\d+(?:,\d+)*)/i) ||
      query.match(/(\d+(?:,\d+)*)\s?(?:rs|rupees|bucks|inr)/i);

    let extractedPrice: number | null = null;
    let matchToRemove: string | null = null;

    if (priceWithSuffixMatch) {
      const val = parseFloat(priceWithSuffixMatch[1]);
      const suffix = priceWithSuffixMatch[2].toLowerCase();
      const multiplier = suffix === 'k' ? 1000 : 1000000;
      extractedPrice = Math.round(val * multiplier);
      matchToRemove = priceWithSuffixMatch[0];
    } else if (standardPriceMatch) {
      const val = standardPriceMatch[1];
      extractedPrice = parseInt(val.replace(/,/g, ''));
      matchToRemove = standardPriceMatch[0];
    }

    const locationMatch = query.match(/(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const item = matchToRemove ? query.replace(matchToRemove, '').replace(locationMatch ? locationMatch[0] : '', '').trim() : query;

    // Use item name for cleaner web search context
    const webData = await getWebMarketPrices(item, deepSearch);

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

    await prisma.log.create({
      data: {
        query,
        priceResult: targetPrice,
        deepSearch,
        status: 'success',
        responseTime,
      },
    });

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
    await prisma.log.create({
      data: {
        query,
        priceResult: 0,
        deepSearch,
        status: 'error',
        responseTime,
      },
    });
    throw error;
  }
}

export async function getLogs() {
  return await prisma.log.findMany({
    orderBy: { timestamp: 'desc' },
    take: 100,
  });
}

export async function getStats() {
  const [totalQueries, avgResponseTime, successCount, totalCount, dailyQueries] = await Promise.all([
    prisma.log.count(),
    prisma.log.aggregate({
      _avg: { responseTime: true },
    }),
    prisma.log.count({ where: { status: 'success' } }),
    prisma.log.count(),
    (prisma.$queryRaw`
      SELECT DATE(timestamp) as date, COUNT(*) as count
      FROM logs
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
      LIMIT 7
    `) as Promise<{ date: string; count: bigint }[]>,
  ]);

  const successRate = totalCount > 0 ? (successCount * 100.0 / totalCount) : 0;

  return {
    totalQueries,
    avgResponseTime: Math.round(avgResponseTime._avg.responseTime || 0),
    successRate: Math.round(successRate),
    dailyQueries: dailyQueries.reverse().map((dq: any) => ({
      date: dq.date,
      count: Number(dq.count),
    })),
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

    CRITICAL: Return ONLY a valid JSON object. Do not include any explanation outside the JSON.

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
    const content = data.choices[0]?.message?.content || "";
    return parseAIResponse<AnalysisResult>(content);
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
  try {
    await prisma.vecItem.delete({ where: { id } });
  } catch {
    // Vec item might not exist, that's okay
  }
  await prisma.priceEntry.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function getTrustedSources() {
  return await prisma.trustedSource.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  });
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
    const existing = await prisma.trustedSource.findUnique({
      where: { url: trimmedUrl },
    });

    if (existing) {
      return { success: false, error: "A source with this URL already exists" };
    }

    await prisma.trustedSource.create({
      data: {
        name: trimmedName,
        url: trimmedUrl,
        category: trimmedCategory,
        isActive: true,
      },
    });

    revalidatePath('/admin/sources');
    return { success: true };
  } catch (error: any) {
    console.error("Add source error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTrustedSource(id: number) {
  try {
    await prisma.trustedSource.delete({ where: { id } });
    revalidatePath('/admin/sources');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleSourceStatus(id: number, isActive: boolean) {
  try {
    await prisma.trustedSource.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath('/admin/sources');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reportUnparsedUrl(url: string, title: string, query: string) {
  try {
    await prisma.reportedUrl.create({
      data: { url, title, query },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Report URL error:", error);
    return { success: false, error: error.message };
  }
}

export async function getReportedUrls() {
  return await prisma.reportedUrl.findMany({
    orderBy: { timestamp: 'desc' },
  });
}

export async function deleteReportedUrl(id: number) {
  try {
    await prisma.reportedUrl.delete({ where: { id } });
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