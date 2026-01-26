export interface WebPriceContext {
  source: string;
  price: number;
  url: string;
  snippet: string;
}

/**
 * This service integrates with SearXNG (or Bing via API) 
 * to fetch real-time price context from the web.
 */
export async function fetchWebPriceContext(query: string): Promise<WebPriceContext[]> {
  // In a production environment, you would use an environment variable for the instance URL
  // For this implementation, we'll use a public SearXNG instance or a mockable structure
  const SEARXNG_INSTANCE = "https://searxng.be"; 
  
  try {
    const response = await fetch(`${SEARXNG_INSTANCE}/search?q=${encodeURIComponent(query + " price in India")}&format=json`);
    
    if (!response.ok) throw new Error("Search failed");
    
    const data = await response.json();
    
    // Extract potential prices using Regex from snippets
    const results: WebPriceContext[] = data.results
      .slice(0, 3)
      .map((res: { title: string, url: string, content: string }) => {
        const priceMatch = res.content.match(/₹\s?(\d+(?:,\d+)?)/) || res.content.match(/Rs\.?\s?(\d+(?:,\d+)?)/);
        return {
          source: res.title,
          url: res.url,
          snippet: res.content,
          price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null
        };
      })
      .filter((res: WebPriceContext) => res.price !== null);

    return results;
  } catch (error) {
    console.error("Web search integration error:", error);
    return [];
  }
}
