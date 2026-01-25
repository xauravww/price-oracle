export interface PriceEntry {
  id: string;
  item: string;
  location: string; // Pin code or Area name
  price: number;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
  isTrusted: boolean;
  contributorId: string;
}

export interface PriceAnalysis {
  averagePrice: number;
  medianPrice: number;
  minReasonable: number;
  maxReasonable: number;
  status: 'Fair' | 'High' | 'Low' | 'Unlikely' | 'Volatile';
  confidenceScore: number;
  totalEntries: number;
  priceTrend: 'Rising' | 'Stable' | 'Falling';
  volatilityIndex: number; // 0 to 1
}

export function calculatePriceClarity(userPrice: number, entries: PriceEntry[]): PriceAnalysis {
  if (entries.length === 0) {
    return {
      averagePrice: 0,
      medianPrice: 0,
      minReasonable: 0,
      maxReasonable: 0,
      status: 'Fair',
      confidenceScore: 0,
      totalEntries: 0,
      priceTrend: 'Stable',
      volatilityIndex: 0,
    };
  }

  // 1. Advanced Weighting (Recency + Reputation + Consensus)
  const now = new Date().getTime();
  const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;

  let totalWeight = 0;
  let weightedSum = 0;
  const prices = entries.map(e => e.price).sort((a, b) => a - b);

  entries.forEach(entry => {
    const ageInMs = now - new Date(entry.timestamp).getTime();
    const timeWeight = Math.max(0.05, 1 - ageInMs / (twoWeeksInMs * 2));
    const reputationWeight = entry.isTrusted ? 2.0 : 1.0;
    const consensusWeight = 1 + (entry.upvotes - entry.downvotes) * 0.1;
    
    const finalWeight = timeWeight * reputationWeight * Math.max(0.1, consensusWeight);
    
    weightedSum += entry.price * finalWeight;
    totalWeight += finalWeight;
  });

  const averagePrice = weightedSum / totalWeight;
  const medianPrice = prices[Math.floor(prices.length / 2)];
  
  // Standard Deviation for Volatility
  const squareDiffs = entries.map(e => Math.pow(e.price - averagePrice, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / entries.length;
  const stdDev = Math.sqrt(avgSquareDiff);
  const volatilityIndex = Math.min(1, stdDev / averagePrice);

  // Dynamic Range based on Volatility
  const rangeMultiplier = 0.15 + (volatilityIndex * 0.2); // 15% to 35% range
  const minReasonable = averagePrice * (1 - rangeMultiplier);
  const maxReasonable = averagePrice * (1 + rangeMultiplier);

  // 2. Trend Analysis (Last 3 days vs Previous)
  const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
  const recentEntries = entries.filter(e => new Date(e.timestamp).getTime() > threeDaysAgo);
  const olderEntries = entries.filter(e => new Date(e.timestamp).getTime() <= threeDaysAgo);
  
  let trend: 'Rising' | 'Stable' | 'Falling' = 'Stable';
  if (recentEntries.length > 0 && olderEntries.length > 0) {
    const recentAvg = recentEntries.reduce((a, b) => a + b.price, 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((a, b) => a + b.price, 0) / olderEntries.length;
    if (recentAvg > olderAvg * 1.05) trend = 'Rising';
    else if (recentAvg < olderAvg * 0.95) trend = 'Falling';
  }

  // 3. Status Determination
  let status: PriceAnalysis['status'] = 'Fair';
  if (volatilityIndex > 0.4) status = 'Volatile';
  else if (userPrice > averagePrice * 1.8 || userPrice < averagePrice * 0.3) status = 'Unlikely';
  else if (userPrice > maxReasonable) status = 'High';
  else if (userPrice < minReasonable) status = 'Low';

  // 4. Confidence Score
  const sampleSizeScore = Math.min(60, (entries.length / 15) * 60);
  const consistencyScore = (1 - volatilityIndex) * 40;
  const confidenceScore = sampleSizeScore + consistencyScore;

  return {
    averagePrice: Math.round(averagePrice),
    medianPrice: Math.round(medianPrice),
    minReasonable: Math.round(minReasonable),
    maxReasonable: Math.round(maxReasonable),
    status,
    confidenceScore: Math.round(confidenceScore),
    totalEntries: entries.length,
    priceTrend: trend,
    volatilityIndex: Number(volatilityIndex.toFixed(2)),
  };
}

export async function getExpertOpinion(item: string, price: number, history: PriceEntry[]): Promise<string> {
  try {
    const response = await fetch(process.env.AI_SERVICE_URL || "http://localhost:3010/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_CLIENT_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a local price expert. Analyze the given price against historical data and give a concise verdict."
          },
          {
            role: "user",
            content: `Item: ${item}, Proposed Price: ${price}. Historical data: ${JSON.stringify(history.slice(0, 5))}`
          }
        ]
      })
    });
    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`Invalid API response: ${JSON.stringify(data)}`);
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    return `Analysis: The price of ₹${price} for ${item} is being evaluated against ${history.length} local market entries. (AI Service temporarily unavailable)`;
  }
}