import 'dotenv/config';
import { addEntry, processPriceRequest, searchSimilarEntries } from './actions';
import prisma from './db';

async function runAllTests() {
  console.log("🧪 Running Comprehensive Price Oracle Tests...\n");

  // 1. Reset Database for clean test
  console.log("🧹 Resetting database...");
  await prisma.vecItem.deleteMany({});
  await prisma.priceEntry.deleteMany({});

  // 2. Seed Data
  console.log("📝 Seeding diverse test data...");
  const seedData = [
    { item: "iPhone 15 Pro 128GB", location: "Delhi", price: 120000, contributorId: "user1" },
    { item: "iPhone 15 Pro 256GB", location: "Mumbai", price: 135000, contributorId: "user2" },
    { item: "Samsung S24 Ultra", location: "Bangalore", price: 110000, contributorId: "user3" },
    { item: "Sony WH-1000XM5", location: "Chennai", price: 28000, contributorId: "user4" },
    { item: "Honda City 2023", location: "Delhi", price: 1500000, contributorId: "user5" },
    { item: "MacBook Air M2", location: "Pune", price: 95000, contributorId: "user6" }
  ];

  for (const data of seedData) {
    await addEntry(data);
    console.log(`   ✅ Added: ${data.item}`);
  }

  // 3. Test Scenario: Semantic Search
  console.log("\n🔍 Scenario 1: Semantic Search Accuracy");
  const searchResults = await searchSimilarEntries("Apple smartphone");
  console.log(`   Query: "Apple smartphone"`);
  searchResults.slice(0, 2).forEach(res => {
    console.log(`   - Found: ${res.item} (₹${res.price})`);
  });
  const isIphoneFirst = searchResults[0]?.item.toLowerCase().includes('iphone');
  console.log(isIphoneFirst ? "   ✅ PASS: iPhone found via semantic search" : "   ❌ FAIL: Semantic search missed iPhone");

  // 4. Test Scenario: Price Extraction & AI Analysis
  console.log("\n🔍 Scenario 2: Price Extraction & AI Verdict");
  const query2 = "I found an iPhone 15 Pro for 125000, is it a good deal?";
  const result2 = await processPriceRequest(query2);
  console.log(`   Query: "${query2}"`);
  console.log(`   Extracted Price: ₹${result2.price}`);
  console.log(`   AI Analysis:\n${JSON.stringify(result2.analysis, null, 2)}`);
  if (result2.price === 125000 && (result2.analysis.verdict.includes("Fair") || result2.analysis.verdict.includes("Underpriced"))) {
    console.log("   ✅ PASS: Correct price extraction and reasonable verdict");
  } else {
    console.log("   ⚠️ NOTE: Check AI output for verdict consistency");
  }

  // 5. Test Scenario: Outlier Detection (Likely Overpriced)
  console.log("\n🔍 Scenario 3: Overpriced Detection");
  const query3 = "Sony headphones for 45000";
  const result3 = await processPriceRequest(query3);
  console.log(`   Query: "${query3}"`);
  console.log(`   AI Analysis:\n${JSON.stringify(result3.analysis, null, 2)}`);
  if (result3.analysis.verdict.toLowerCase().includes("high") || result3.analysis.verdict.toLowerCase().includes("overpriced")) {
    console.log("   ✅ PASS: Correctly identified high price");
  }

  // 6. Test Scenario: High-Value Asset (Car)
  console.log("\n🔍 Scenario 4: High-Value Asset Analysis");
  const query4 = "Honda City 2023 for 14 lakhs";
  const result4 = await processPriceRequest(query4);
  console.log(`   Query: "${query4}"`);
  console.log(`   AI Analysis:\n${JSON.stringify(result4.analysis, null, 2)}`);

  console.log("\n✨ All tests completed.");
}

runAllTests().catch(console.error);
