import { calculatePriceClarity, PriceEntry } from './priceEngine';

const mockEntries: PriceEntry[] = [
  { id: '1', item: 'Auto', location: '110001', price: 100, timestamp: new Date(), upvotes: 0, downvotes: 0, contributorId: 'user1', isTrusted: false },
  { id: '2', item: 'Auto', location: '110001', price: 110, timestamp: new Date(), upvotes: 0, downvotes: 0, contributorId: 'user2', isTrusted: false },
  { id: '3', item: 'Auto', location: '110001', price: 90, timestamp: new Date(), upvotes: 0, downvotes: 0, contributorId: 'user3', isTrusted: false },
];

console.log('--- Testing Price Oracle Logic ---');

const testFair = calculatePriceClarity(105, mockEntries);
console.log('Test 105 (Expected Fair):', testFair.status === 'Fair' ? '✅ PASS' : '❌ FAIL', testFair.status);

const testHigh = calculatePriceClarity(150, mockEntries);
console.log('Test 150 (Expected High):', testHigh.status === 'High' ? '✅ PASS' : '❌ FAIL', testHigh.status);

const testUnlikely = calculatePriceClarity(500, mockEntries);
console.log('Test 500 (Expected Unlikely):', testUnlikely.status === 'Unlikely' ? '✅ PASS' : '❌ FAIL', testUnlikely.status);