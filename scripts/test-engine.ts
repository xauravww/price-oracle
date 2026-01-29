import { addEntry, searchSimilarEntries } from '@/lib/actions';
import { calculatePriceClarity, getExpertOpinion } from '@/lib/priceEngine';

async function runTest() {
  console.log('--- Starting Test Scenario ---');

  try {
    // 1. Add baseline data
    console.log('Adding test entries...');
    await addEntry({ item: 'auto', location: 'delhi', price: 40, contributorId: 'user1' });
    await addEntry({ item: 'auto', location: 'delhi', price: 60, contributorId: 'user2' });
    await addEntry({ item: 'auto', location: 'delhi', price: 100, contributorId: 'user3' });
    await addEntry({ item: 'auto', location: 'delhi', price: 50, contributorId: 'user4' });
    console.log('Entries added successfully.\n');

    // 2. Run analysis for a fair price
    console.log('Analyzing price: ₹50 for auto in delhi...');
    const entries = await searchSimilarEntries('auto');
    console.log(`Found ${entries.length} similar entries.`);

    const analysisFair = calculatePriceClarity(50, entries);
    console.log('Engine Result:', JSON.stringify(analysisFair, null, 2));

    console.log('Fetching AI Expert Opinion...');
    const opinion = await getExpertOpinion('auto', 50, entries);
    console.log('AI Opinion:', opinion);
    console.log('-----------------------------------\n');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();