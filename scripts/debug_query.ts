
import { processPriceRequest } from '../src/lib/actions';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function debugQuery() {
    const query = "iphone 12 in 12000 rs";
    console.log(`\n🔍 Debugging Query: "${query}"\n`);
    console.log("----------------------------------------");

    try {
        const result = await processPriceRequest(query, false);

        console.log(`\n📊 Analysis Verdict: ${result.analysis.verdict}`);
        console.log(`💰 Target Price: ${result.price}`);
        console.log(`🧠 Confidence: ${result.confidenceScore}`);

        console.log("\n🌐 Web Data Results:");
        result.webData.forEach((item, index) => {
            console.log(`\n[${index + 1}] ${item.title}`);
            console.log(`    Source: ${item.source}`);
            console.log(`    URL: ${item.url}`);
            if (!item.price) {
                console.log(`    ❌ NO PRICE. Snippet: ${item.body.substring(0, 150)}...`);
            } else {
                console.log(`    💰 Price Found: ${item.price}`);
            }
        });

    } catch (error) {
        console.error("❌ Error running processPriceRequest:", error);
    }
}

debugQuery();
