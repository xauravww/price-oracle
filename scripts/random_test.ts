
import { processPriceRequest } from '../src/lib/actions';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const QUERIES = [
    "iphone 12 in 12000 rs",
    "macbook air m1 price",
    "sony wh-1000xm5 price in india",
    "samsung s23 ultra 512gb price",
    "ps5 slim digital edition price",
    "nikon z6 ii body only price",
    "nothing phone 2 12gb 256gb price",
    "airpods pro 2nd gen type c price"
];

async function runRobustnessTest() {
    console.log("🚀 Starting Robustness Test...");
    console.log("--------------------------------");

    let totalQueries = 0;
    let totalUrlsFound = 0;
    let totalPricesFound = 0;

    // Pick a random query or run all sequentially? User said "pick a random query then test again".
    // Let's run a random one to simulate the user's flow, but maybe loop a few times for stats.

    const randomQuery = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    const queriesToRun = [randomQuery];

    console.log(`🎯 Selected Query: "${randomQuery}"`);

    for (const query of queriesToRun) {
        try {
            console.log(`\nProcessing: "${query}"...`);
            const startTime = Date.now();
            const result = await processPriceRequest(query, false);
            const duration = Date.now() - startTime;

            const urlsCount = result.webData.length;
            const pricesCount = result.webData.filter(i => i.price).length;

            totalQueries++;
            totalUrlsFound += urlsCount;
            totalPricesFound += pricesCount;

            console.log(`✅ Completed in ${duration}ms`);
            console.log(`📊 URLs Found: ${urlsCount}`);
            console.log(`💰 Prices Extracted: ${pricesCount}`);
            console.log(`📉 Success Rate: ${Math.round((pricesCount / urlsCount) * 100)}%`);

            result.webData.forEach((item, idx) => {
                if (!item.price) {
                    console.log(`   [${idx + 1}] ❌ No Price: ${item.source} (${item.url})`);
                }
            });

        } catch (e) {
            console.error(`❌ Failed query "${query}":`, e);
        }
    }

    console.log("\n--------------------------------");
    console.log(`🏁 Test Complete.`);
}

runRobustnessTest();
