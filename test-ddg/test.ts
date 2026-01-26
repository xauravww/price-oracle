import { search } from 'duck-duck-scrape';

async function runTest() {
  try {
    console.log('Searching for "node.js"...');
    const results = await search('node.js', {
      safeSearch: 0
    });
    
    if (results.results && results.results.length > 0) {
      console.log('Success! Found ' + results.results.length + ' results.');
      console.log('First result title:', results.results[0].title);
      console.log('First result URL:', results.results[0].url);
    } else {
      console.log('No results found.');
    }
  } catch (error) {
    console.error('Error during search:', error);
  }
}

runTest();