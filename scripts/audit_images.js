import fs from 'fs';
import path from 'path';
import https from 'https';

const FILES_TO_SCAN = [
    'src/constants/appData.js',
    'src/constants/publicTripsData.js',
    'src/utils/tripUtils.jsx'
];

const URL_REGEX = /https?:\/\/[^\s"'`]+/g;

async function checkUrl(url) {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
            if (res.statusCode >= 400) {
                // Some servers forbid HEAD, try GET with range 0-0 or just assume 405/403 is "alive" but verify status
                // Unsplash returns 404 if invalid.
                resolve({ url, status: res.statusCode, error: `HTTP ${res.statusCode}` });
            } else {
                resolve({ url, status: res.statusCode, ok: true });
            }
        });
        req.on('error', (e) => resolve({ url, error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ url, error: 'Timeout' }); });
        req.end();
    });
}

async function audit() {
    console.log('--- START IMAGE AUDIT ---');
    let allUrls = [];

    // 1. Extract URLs
    FILES_TO_SCAN.forEach(file => {
        const fullPath = path.resolve(process.cwd(), file);
        if (!fs.existsSync(fullPath)) {
            console.log(`Skipping missing file: ${file}`);
            return;
        }
        const content = fs.readFileSync(fullPath, 'utf8');
        const matches = content.match(URL_REGEX) || [];
        matches.forEach(url => {
            // Filter standard image URLs or Unsplash
            if (url.includes('unsplash.com') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                allUrls.push({ url, file });
            }
        });
    });

    // 2. Analyze Duplicates
    const counts = {};
    allUrls.forEach(item => {
        counts[item.url] = (counts[item.url] || 0) + 1;
    });

    console.log(`\nFound ${allUrls.length} total image references.`);
    console.log(`${Object.keys(counts).length} unique URLs.`);

    const duplicates = Object.entries(counts).filter(([url, count]) => count > 1).sort((a, b) => b[1] - a[1]);

    if (duplicates.length > 0) {
        console.log('\n[DUPLICATE IMAGES]');
        duplicates.slice(0, 10).forEach(([url, count]) => {
            console.log(`  x${count}: ${url}`);
        });
    }

    // 3. Check Validity (HEAD key checks)
    console.log('\n[CONNECTIVITY CHECK]');
    const uniqueUrls = Object.keys(counts);
    const results = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < uniqueUrls.length; i += BATCH_SIZE) {
        const batch = uniqueUrls.slice(i, i + BATCH_SIZE);
        const promises = batch.map(url => checkUrl(url));
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
        process.stdout.write(`\rChecking... ${Math.min(i + BATCH_SIZE, uniqueUrls.length)}/${uniqueUrls.length}`);
    }

    console.log('\n');
    const failures = results.filter(r => !r.ok);

    if (failures.length > 0) {
        console.log('❌ DEAD/BROKEN IMAGES FOUND:');
        failures.forEach(f => console.log(`  [${f.error || f.status}] ${f.url}`));
    } else {
        console.log('✅ All images reachable.');
    }

    console.log('\n--- END AUDIT ---');
}

audit();
