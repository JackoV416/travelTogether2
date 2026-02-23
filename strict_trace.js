import fs from 'fs';

const content = fs.readFileSync('src/i18n.js', 'utf8');
const lines = content.split('\n');

let braceCount = 0;
let inString = false;
let escapeNext = false;

// We only want to count braces inside the `resources` object
let startLine = -1;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('const resources = {')) {
        startLine = i;
    }

    if (startLine === -1) continue;

    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (escapeNext) {
            escapeNext = false;
            continue;
        }
        if (char === '\\') {
            escapeNext = true;
            continue;
        }
        if (char === '"' || char === "'") {
            if (j === 0 || line[j - 1] !== '\\') {
                if (!inString) inString = char;
                else if (inString === char) inString = false;
            }
        }

        if (!inString) {
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    console.log(`Resources object closed at line ${i + 1}:\n${line}`);
                    // If this is NOT the end of the resources object, we found an early closure!
                    if (!line.includes('};')) {
                        console.error("EARLY CLOSURE DETECTED!");
                        process.exit(1);
                    } else {
                        console.log("Normal closure!");
                        process.exit(0);
                    }
                }
            }
        }
    }
}
