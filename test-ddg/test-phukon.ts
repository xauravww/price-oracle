import { DDGS } from '@phukon/duckduckgo-search';

async function runTest() {
  try {
    console.log('Searching for "OpenAI" using @phukon/duckduckgo-search DDGS class...');
    const ddgs = new DDGS();
    const results = await ddgs.text({ keywords: 'OpenAI' });
    
    if (results && results.length > 0) {
      console.log('Success! Found ' + results.length + ' results.');
      console.log('First result title:', results[0].title);
      console.log('First result URL:', results[0].href);
    } else {
      console.log('No results found or empty response.');
      console.log('Full response:', results);
    }
  } catch (error) {
    console.error('Error during search:', error);
  }
}

runTest();