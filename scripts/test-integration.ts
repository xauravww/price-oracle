import { processPriceRequest } from './src/lib/actions';

async function test() {
  console.log("Testing query: 'iPhone 16 for 75000 in Delhi' with deepSearch=true");
  try {
    const result = await processPriceRequest("iPhone 16 for 75000 in Delhi", true);
    console.log("\n--- RESULT ---");
    console.log("Symbol/Item:", result.symbol);
    console.log("Price:", result.price);
    console.log("Confidence:", result.confidenceScore);
    console.log("\n--- ANALYSIS ---");
    console.log(JSON.stringify(result.analysis, null, 2));
    console.log("\n--- WEB DATA (Jina Reader Output) ---");
    if (result.webData && result.webData.length > 0) {
      console.log(result.webData[0].body.substring(0, 500) + "...");
    } else {
      console.log("No web data found");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
