
const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

const files = getAllFiles('./src');
const usedKeys = new Set();
const regex = /[^a-zA-Z]t\(['"]([a-zA-Z0-9_.]+)['"]\)/g;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(content)) !== null) {
        usedKeys.add(match[1]);
    }
});

const i18nContent = fs.readFileSync('./src/i18n.js', 'utf8');
const missingKeys = [];

usedKeys.forEach(key => {
    // Simple check: does the key string appear in i18n.js?
    // This isn't perfect (could match substring), but good enough for finding totally missing keys.
    if (!i18nContent.includes(`"${key.split('.').pop()}":`) && !i18nContent.includes(`'${key.split('.').pop()}':`)) {
        // Check deeply nested structure is hard with text search.
        // Let's rely on the full key scanning if possible, or just exact "leaf" match.
        // Better: Let's just output ALL used keys and I'll manually check the suspicious ones.
    }
});

console.log('--- All Used Keys ---');
const sortedKeys = Array.from(usedKeys).sort();
sortedKeys.forEach(k => {
    // Check if the leaf part of the key exists in i18n file
    const leaf = k.split('.').pop();
    const leafExists = i18nContent.includes(`"${leaf}"`) || i18nContent.includes(`'${leaf}'`);
    if (!leafExists) {
        console.log(`[MISSING?] ${k}`);
    } else {
        // console.log(`[OK] ${k}`);
    }
});
