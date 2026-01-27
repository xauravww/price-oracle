export interface AIAdvice {
  opinion: string;
  negotiationTips: string[];
  marketContext: string;
}

export type MessageContent = string;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
}

export async function getChatCompletion(
  messages: ChatMessage[],
  model?: string
) {
  try {
    const payload: any = {
      messages,
      temperature: 0.7
    };
    
    if (model) {
      payload.model = model;
    }

    const response = await fetch("http://localhost:3010/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("AI Server unreachable");
    
    return await response.json();
  } catch (error) {
    console.error("Chat Completion Error:", error);
    return null;
  }
}

export async function getAIPriceAdvice(
  item: string, 
  price: number, 
  analysis: { averagePrice: number, status: string, volatilityIndex: number }, 
  webContext: { source: string, price: number }[]
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

    const content: MessageContent = prompt;

    const data = await getChatCompletion([{ role: "user", content }]);
    if (!data) return null;

    const responseContent = data.choices[0].message.content;
    
    // Extract JSON from response if AI wraps it in markdown
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : responseContent);
  } catch (error) {
    console.error("AI Integration Error:", error);
    return null;
  }
}
