/**
 * Quick test to verify Serper.dev integration with multi-key support
 * Usage: node test-serper.js
 */

async function testSerper() {
    // Check for multiple keys first, then single key
    const multiKeys = process.env.SERPER_API_KEYS;
    const singleKey = process.env.SERPER_API_KEY;

    let apiKeys = [];

    if (multiKeys) {
        apiKeys = multiKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    } else if (singleKey) {
        apiKeys = [singleKey.trim()];
    }

    if (apiKeys.length === 0) {
        console.error('❌ No Serper API keys found in environment');
        console.log('\n📝 To fix this:');
        console.log('1. Create a .env file in your project root');
        console.log('2. Add ONE of the following:');
        console.log('   • Multiple keys: SERPER_API_KEYS=key1,key2,key3');
        console.log('   • Single key: SERPER_API_KEY=your_key_here');
        console.log('3. Get your key(s) from: https://serper.dev/dashboard\n');
        process.exit(1);
    }

    console.log('🔍 Testing Serper.dev API...\n');
    console.log(`📊 Found ${apiKeys.length} API key${apiKeys.length > 1 ? 's' : ''}`);
    console.log(`💡 Total capacity: ${apiKeys.length * 2500} searches/month\n`);
    console.log('Query: "iphone 15 pro max price india"\n');

    let successCount = 0;
    let failCount = 0;

    // Test each key
    for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i];
        const keyNum = i + 1;
        const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);

        console.log(`[Key ${keyNum}/${apiKeys.length}] Testing ${maskedKey}...`);

        try {
            const response = await fetch('https://google.serper.dev/search', {
                method: 'POST',
                headers: {
                    'X-API-KEY': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: 'iphone 15 pro max price india',
                    gl: 'in',
                    hl: 'en',
                    num: 5,
                }),
            });

            if (!response.ok) {
                failCount++;
                console.log(`❌ Key ${keyNum}: HTTP ${response.status} ${response.statusText}\n`);
                continue;
            }

            const data = await response.json();

            if (data.organic && data.organic.length > 0) {
                successCount++;
                console.log(`✅ Key ${keyNum}: Working! (${data.organic.length} results)`);

                if (apiKeys.length === 1) {
                    // Show sample results only for single key test
                    console.log('\n📝 Sample Results:');
                    data.organic.slice(0, 2).forEach((result, idx) => {
                        console.log(`   ${idx + 1}. ${result.title.substring(0, 60)}...`);
                    });
                }
                console.log('');
            } else {
                failCount++;
                console.log(`⚠️  Key ${keyNum}: No results returned\n`);
            }

        } catch (error) {
            failCount++;
            console.log(`❌ Key ${keyNum}: ${error.message}\n`);
        }

        // Small delay between requests
        if (i < apiKeys.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.log('═'.repeat(60));
    console.log('\n📊 Test Summary:\n');
    console.log(`✅ Working keys: ${successCount}/${apiKeys.length}`);
    console.log(`❌ Failed keys: ${failCount}/${apiKeys.length}`);
    console.log(`💰 Available capacity: ${successCount * 2500} searches/month\n`);

    if (successCount > 0) {
        console.log('🎉 Serper.dev is configured correctly!');
        console.log('💡 Your Price Oracle app will use this as fallback when DuckDuckGo fails.');

        if (successCount < apiKeys.length) {
            console.log('\n⚠️  Some keys failed - check those in your Serper dashboard');
        }

        if (apiKeys.length > 1) {
            console.log(`\n🔄 Round-robin rotation: Load will distribute across ${successCount} working key${successCount > 1 ? 's' : ''}`);
        }
    } else {
        console.log('❌ All keys failed!');
        console.log('\n📝 Troubleshooting:');
        console.log('1. Verify keys at: https://serper.dev/dashboard');
        console.log('2. Check you haven\'t exceeded quota (2,500/month per key)');
        console.log('3. Make sure keys are active and valid\n');
        process.exit(1);
    }

    console.log('');
}

// Load .env if available
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not installed, that's okay - will use process.env
}

testSerper();
