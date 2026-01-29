// Test script to find working SearXNG instances with JSON API
const https = require('https');
const http = require('http');

const SEARXNG_INSTANCES = [
    'https://searxng.site',
    'https://searx.rhscz.eu',
    'https://search.inetol.net',
    'https://search.bladerunn.in',
    'https://search.ononoki.org',
    'https://searx.dresden.network',
    'https://search.ipv6s.net',
    'https://search.charliewhiskey.net',
    'https://searxng.cups.moe',
    'https://searx.namejeff.xyz',
    'https://searxng.canine.tools',
    'https://search.mdosch.de',
    'https://searx.party',
    'https://baresearch.org',
    'https://priv.au',
    'https://searx.ox2.fr',
];

const TEST_QUERY = 'iphone 15 pro max price India';

async function testInstance(baseUrl) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const encodedQuery = encodeURIComponent(TEST_QUERY);
        const url = `${baseUrl}/search?q=${encodedQuery}&format=json&categories=general`;

        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;

        const req = protocol.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; PriceOracle/1.0)',
                'Accept': 'application/json',
            }
        }, (res) => {
            const responseTime = Date.now() - startTime;
            let data = '';

            res.on('data', chunk => data += chunk);

            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const json = JSON.parse(data);
                        const resultCount = json.results?.length || 0;

                        resolve({
                            url: baseUrl,
                            status: 'SUCCESS',
                            statusCode: res.statusCode,
                            responseTime,
                            resultCount,
                            hasResults: resultCount > 0,
                            sample: json.results?.[0] ? {
                                title: json.results[0].title?.substring(0, 50),
                                url: json.results[0].url?.substring(0, 60),
                            } : null
                        });
                    } else {
                        resolve({
                            url: baseUrl,
                            status: 'HTTP_ERROR',
                            statusCode: res.statusCode,
                            responseTime,
                            error: `HTTP ${res.statusCode}`
                        });
                    }
                } catch (e) {
                    resolve({
                        url: baseUrl,
                        status: 'PARSE_ERROR',
                        statusCode: res.statusCode,
                        responseTime,
                        error: e.message
                    });
                }
            });
        });

        req.on('error', (e) => {
            resolve({
                url: baseUrl,
                status: 'NETWORK_ERROR',
                error: e.message,
                responseTime: Date.now() - startTime
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                url: baseUrl,
                status: 'TIMEOUT',
                error: 'Request timeout',
                responseTime: Date.now() - startTime
            });
        });
    });
}

async function main() {
    console.log('🔍 Testing SearXNG instances...\n');
    console.log(`Query: "${TEST_QUERY}"\n`);
    console.log('='.repeat(80));

    const results = [];

    for (const instance of SEARXNG_INSTANCES) {
        process.stdout.write(`Testing ${instance}... `);
        const result = await testInstance(instance);
        results.push(result);

        if (result.status === 'SUCCESS') {
            console.log(`✅ ${result.responseTime}ms - ${result.resultCount} results`);
        } else {
            console.log(`❌ ${result.status} - ${result.error || 'Failed'}`);
        }

        // Small delay to avoid hammering servers
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SUMMARY:\n');

    const working = results.filter(r => r.status === 'SUCCESS' && r.hasResults);
    const failed = results.filter(r => r.status !== 'SUCCESS' || !r.hasResults);

    console.log(`✅ Working instances: ${working.length}/${SEARXNG_INSTANCES.length}`);
    console.log(`❌ Failed instances: ${failed.length}/${SEARXNG_INSTANCES.length}\n`);

    if (working.length > 0) {
        console.log('🎯 TOP 5 RECOMMENDED INSTANCES (by response time):\n');
        working
            .sort((a, b) => a.responseTime - b.responseTime)
            .slice(0, 5)
            .forEach((r, i) => {
                console.log(`${i + 1}. ${r.url}`);
                console.log(`   ⏱️  Response: ${r.responseTime}ms`);
                console.log(`   📄 Results: ${r.resultCount}`);
                if (r.sample) {
                    console.log(`   📝 Sample: ${r.sample.title}...`);
                }
                console.log('');
            });
    }

    console.log('\n💡 Usage in your code:');
    if (working.length > 0) {
        const fastest = working.sort((a, b) => a.responseTime - b.responseTime)[0];
        console.log(`\nconst SEARXNG_URL = '${fastest.url}';`);
        console.log(`\n// Then make requests to: \${SEARXNG_URL}/search?q=...&format=json`);
    }
}

main().catch(console.error);
