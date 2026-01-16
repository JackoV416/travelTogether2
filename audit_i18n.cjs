const fs = require('fs');

const content = fs.readFileSync('src/i18n.js', 'utf8');
const resourcesMatch = content.match(/const resources = (\{[\s\S]*?\});/);

if (!resourcesMatch) {
    console.error("Could not find resources object in i18n.js");
    process.exit(1);
}

let resObj;
try {
    resObj = eval('(' + resourcesMatch[1] + ')');
} catch (e) {
    console.error("Failed to parse resources object:", e);
    process.exit(1);
}

function flatten(obj, prefix = '') {
    let keys = [];
    for (let key in obj) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            keys = keys.concat(flatten(obj[key], prefix + key + '.'));
        } else {
            keys.push(prefix + key);
        }
    }
    return keys;
}

const usedKeysContent = fs.readFileSync('used_keys.txt', 'utf8');
const usedKeys = usedKeysContent.split('\n').filter(Boolean);

const locales = Object.keys(resObj);
locales.forEach(locale => {
    const localeKeys = flatten(resObj[locale].translation);
    const missing = usedKeys.filter(k => {
        // Handle dynamic keys (e.g. itinerary.weekdays.${keys[day]})
        // If the prefix matches, we consider it "half-found" but for this audit we'll be strict
        return !localeKeys.includes(k);
    });
    console.log(`--- ${locale} MISSING KEYS ---`);
    missing.sort().forEach(k => {
        // Filter out obviously dynamic keys or false positives
        if (k === 'div' || k === 'startTime' || k === 'return' || k === 'id' || k === 'view') return;
        console.log(k);
    });
});
