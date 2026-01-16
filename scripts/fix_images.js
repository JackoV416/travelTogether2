import fs from 'fs';
import path from 'path';

const FILES = [
    'src/constants/publicTripsData.js',
    'src/constants/appData.js'
];

function fix() {
    FILES.forEach(file => {
        const fullPath = path.resolve(process.cwd(), file);
        if (!fs.existsSync(fullPath)) return;

        let content = fs.readFileSync(fullPath, 'utf8');

        // Regex: matches "image:" followed by optional whitespace, then string in ', ", or `
        // Handles optional leading/trailing commas
        const regex = /,\s*image:\s*(['"`])[^'"`]+\1|image:\s*(['"`])[^'"`]+\2,\s*/g;
        const regex2 = /\s*image:\s*(['"`])[^'"`]+\1\s*/g;

        let newContent = content.replace(regex, '');
        newContent = newContent.replace(regex2, '');

        if (content.length !== newContent.length) {
            console.log(`[${file}] Fixed ${content.length - newContent.length} chars.`);
            fs.writeFileSync(fullPath, newContent);
        } else {
            console.log(`[${file}] No image properties found to remove.`);
        }
    });
}

fix();
