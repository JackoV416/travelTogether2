
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const i18nPath = path.join(projectRoot, 'src', 'i18n.js');
const tempPath = path.join(__dirname, 'temp_audit_exec.js');

try {
    let content = fs.readFileSync(i18nPath, 'utf-8');

    // Robust extraction: Find "const resources = {" and count braces
    const startMarker = 'const resources = {';
    const startIndex = content.indexOf(startMarker);

    if (startIndex === -1) {
        throw new Error('Could not find "const resources = {" in i18n.js');
    }

    let braceCount = 0;
    let endIndex = -1;
    let inString = false;
    let stringChar = '';
    let inComment = false;

    const braceStart = startIndex + startMarker.length - 1;

    for (let i = braceStart; i < content.length; i++) {
        const char = content[i];

        if (braceCount === 0 && i > braceStart) {
            break;
        }

        if ((char === '"' || char === "'") && !inComment) {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar && content[i - 1] !== '\\') {
                inString = false;
            }
        }

        if (!inString && !inComment) {
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    endIndex = i;
                    break;
                }
            }
        }
    }

    if (endIndex === -1) {
        throw new Error('Could not find closing brace for resources object');
    }

    const resourcesObjCode = content.substring(startIndex, endIndex + 1);

    // Construct valid executable script
    const script = `
    const resources = ${resourcesObjCode.substring(resourcesObjCode.indexOf('=') + 1)};
    
    // Comparison Logic
    function compareKeys(base, target, prefix = '') {
        const missing = [];
        for (const key in base) {
            const fullKey = prefix ? \`\${prefix}.\${key}\` : key;
            if (target[key] === undefined) {
                missing.push(fullKey);
            } else if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
                 if (typeof target[key] !== 'object') {
                     // mismatch type
                 } else {
                     missing.push(...compareKeys(base[key], target[key], fullKey));
                 }
            }
        }
        return missing;
    }

    // Interpolation Check logic
    function getVars(str) {
        if (typeof str !== 'string') return [];
        const matches = [...str.matchAll(/\\{\\{(\\w+)\\}\\}/g)];
        return matches.map(m => m[1]).sort();
    }

    function checkInterpolation(base, target, prefix = '') {
        const issues = [];
        for (const key in base) {
            const fullKey = prefix ? \`\${prefix}.\${key}\` : key;
            if (typeof base[key] === 'string' && target && typeof target[key] === 'string') {
                const v1 = getVars(base[key]);
                const v2 = getVars(target[key]);
                if (JSON.stringify(v1) !== JSON.stringify(v2)) {
                    issues.push(\`\${fullKey}: en=\${JSON.stringify(v1)} vs target=\${JSON.stringify(v2)}\`);
                }
            } else if (typeof base[key] === 'object' && target && typeof target[key] === 'object') {
                issues.push(...checkInterpolation(base[key], target[key], fullKey));
            }
        }
        return issues;
    }

    const en = resources.en.translation;
    const zhHK = resources['zh-HK']?.translation;
    const zhTWKey = resources['zh-TW'] ? 'zh-TW' : (resources['zh'] ? 'zh' : null);
    const zhTW = zhTWKey ? resources[zhTWKey].translation : undefined;

    console.log('--- START AUDIT ---');
    console.log('Available Languages:', Object.keys(resources));

    if (!zhHK) console.error('CRITICAL: zh-HK translation missing!');
    if (!zhTW) console.error('CRITICAL: zh-TW (and zh) translation missing!');
    
    // Key Parity
    if (zhHK) {
        const missingHK = compareKeys(en, zhHK);
        if (missingHK.length > 0) {
            console.log('[MISSING zh-HK]:');
            missingHK.forEach(k => console.log('  ' + k));
        } else {
            console.log('[zh-HK] Keys verified ✅');
        }
    }

    if (zhTW) {
        const missingTW = compareKeys(en, zhTW);
        if (missingTW.length > 0) {
             console.log(\`[MISSING \${zhTWKey}]:\`);
             missingTW.forEach(k => console.log('  ' + k));
        } else {
            console.log(\`[\${zhTWKey}] Keys verified ✅\`);
        }
    }

    // Interpolation
    if (zhHK) {
        const interpHK = checkInterpolation(en, zhHK);
        if (interpHK.length > 0) {
            console.log('[VAR MISMATCH zh-HK]:');
            interpHK.forEach(i => console.log('  ' + i));
        }
    }

    if (zhTW) {
        const interpTW = checkInterpolation(en, zhTW);
        if (interpTW.length > 0) {
            console.log(\`[VAR MISMATCH \${zhTWKey}]:\`);
            interpTW.forEach(i => console.log('  ' + i));
        }
    }

    console.log('--- END AUDIT ---');
    `;

    fs.writeFileSync(tempPath, script);

    const result = execSync(`node ${tempPath}`, { encoding: 'utf-8' });
    console.log(result);

} catch (e) {
    console.error("Audit Error:", e.message);
    if (e.stdout) console.log(e.stdout.toString());
    if (e.stderr) console.error(e.stderr.toString());
} finally {
    if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
    }
}
