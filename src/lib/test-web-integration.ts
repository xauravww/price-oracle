
import { processPriceRequest } from './actions';

async function testIntegration() {
  console.log('--- Testing Web Search Integration ---');
  const query = "iPhone 15 price 70000";
  console.log(`Query: "${query}"`);
  
  try {
    const result = await processPriceRequest(query);
    console.log('\n--- Result ---');
    console.log('Extracted Price:', result.price);
    console.log('AI Analysis:\n', JSON.stringify(result.analysis, null, 2));
    
    if (result.analysis.verdict) {
      console.log('\n✅ SUCCESS: Received a structured response from AI.');
    } else {
      console.log('\n⚠️ WARNING: Response might be a fallback.');
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
}

testIntegration();
      