import { addEntry, searchSimilarEntries, processPriceRequest } from './actions';
import prisma from './db';
import * as dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log("🚀 Starting Price Oracle Test Scenarios...\n");

  // 1. Clear existing test data
  await prisma.vecItem.deleteMany({});
  await prisma.priceEntry.deleteMany({});

  const testData = [
    { item: "iPhone 15 Pro 128GB", price: 120000, location: "Mumbai" },
    { item: "iPhone 15 Pro 256GB", price: 135000, location: "Delhi" },
    { item: "Samsung S24 Ultra", price: 110000, location: "Bangalore" },
    { item: "MacBook Air M2", price: 95000, location: "Mumbai" },
    { item: "Sony WH-1000XM5", price: 28000, location: "Chennai" },
    { item: "Honda City 2023", price: 1500000, location: "Delhi" },
    { item: "Toyota Glanza", price: 850000, location: "Pune" },
  ];

  console.log("📝 Seeding test data...");
  for (const data of testData) {
    await addEntry({
      ...data,
      contributorId: "test-user"
    });
    console.log(`   Added: ${data.item} at ₹${data.price}`);
  }

  console.log("\n🔍 Scenario 1: Semantic Search (iPhone)");
  const iphoneResults = await searchSimilarEntries("I want to buy an Apple phone");
  console.log(`   Found ${iphoneResults.length} matches for "Apple phone"`);
  iphoneResults.forEach(r => console.log(`   - ${r.item}: ₹${r.price}`));

  console.log("\n🔍 Scenario 2: Price Extraction & Analysis");
  const query = "I found an iPhone 15 Pro for 125000, is it a good deal?";
  console.log(`   Query: "${query}"`);
  const result = await processPriceRequest(query);
  console.log(`   Predicted Price: ₹${result.price}`);
  console.log(`   Analysis:\n${JSON.stringify(result.analysis, null, 2)}`);

  console.log("\n🔍 Scenario 3: Multi-Location Product Check");
  const multiLocationProduct = "Sony WH-1000XM5";
  const reports = [
    { loc: "Mumbai", price: 26000, user: "user_mumbai" },
    { loc: "Delhi", price: 27500, user: "user_delhi" },
    { loc: "Bangalore", price: 29000, user: "user_blr" },
    { loc: "Chennai", price: 25500, user: "user_chn" }
  ];

  console.log(`   Adding 4 reports for ${multiLocationProduct} from different cities...`);
  for (const r of reports) {
    await addEntry({
      item: multiLocationProduct,
      location: r.loc,
      price: r.price,
      contributorId: r.user
    });
  }

  const multiResult = await processPriceRequest(`What is the average price for ${multiLocationProduct} across India?`);
  console.log(`   Predicted Price: ₹${multiResult.price}`);
  console.log(`   Analysis:\n${JSON.stringify(multiResult.analysis, null, 2)}`);

  console.log("\n🔍 Scenario 4: Car Market Check");
  const carResult = await processPriceRequest("Honda City price in Delhi");
  console.log(`   Predicted Price: ₹${carResult.price}`);
  console.log(`   Analysis:\n${JSON.stringify(carResult.analysis, null, 2)}`);

  console.log("\n✅ Tests completed.");
}

runTests().catch(console.error);