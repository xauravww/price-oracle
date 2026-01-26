const { duckIt } = require('node-duckduckgo');

async function testDuckDuckGoSearch() {
  console.log('Testing DuckDuckGo Search with node-duckduckgo...\n');
  
  try {
    // Test basic search
    console.log('1. Testing basic search for "JavaScript tutorials":');
    const response1 = await duckIt('JavaScript tutorials');
    const results1 = response1.data.Results || [];
    console.log(`Found ${results1.length} results`);
    results1.slice(0, 3).forEach((result, index) => {
      console.log(`${index + 1}. ${result.Text}`);
      console.log(`   URL: ${result.FirstURL}`);
    });
    console.log('');
    
    // Test search with options
    console.log('2. Testing search with no HTML:');
    const response2 = await duckIt('React hooks', { noHtml: true, parentalFilter: 'Moderate' });
    const results2 = response2.data.Results || [];
    console.log(`Found ${results2.length} results`);
    results2.slice(0, 2).forEach((result, index) => {
      console.log(`${index + 1}. ${result.Text}`);
    });
    console.log('');
    
    // Test search for simple query
    console.log('3. Testing simple query "Node.js":');
    const response3 = await duckIt('Node.js');
    const results3 = response3.data.Results || [];
    if (results3.length > 0) {
      console.log(`First result: ${results3[0].Text}`);
    }
    
    console.log('\n✅ DuckDuckGo search test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during search test:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testDuckDuckGoSearch();