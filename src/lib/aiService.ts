export interface AIAdvice {
  opinion: string;
  negotiationTips: string[];
  marketContext: string;
}

export async function getAIPriceAdvice(
  item: string, 
  price: number, 
  analysis: any, 
  webContext: any[]
): Promise<AIAdvice | null> {
  try {
    const prompt = `
      As a local market expert, analyze this price:
      Item: ${item}
      User Price: ₹${price}
      Market Average: ₹${analysis.averagePrice}
      Verdict: ${analysis.status}
      Volatility: ${analysis.volatilityIndex * 100}%
      Web Context: ${JSON.stringify(webContext.map(w => ({ source: w.source, price: w.price })))}

      Provide a concise expert opinion, 2-3 negotiation tips, and brief market context.
      Format as JSON: { "opinion": "...", "negotiationTips": ["...", "..."], "marketContext": "..." }
    `;

    const response = await fetch("http://localhost:3010/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error("AI Server unreachable");
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response if AI wraps it in markdown
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch (error) {
    console.error("AI Integration Error:", error);
    return null;
  }
}
