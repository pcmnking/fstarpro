
const fs = require('fs');

const dataFile = 'e:/AI/antigravity/fstar/assets/js/ziwei_data_P.js';
const content = fs.readFileSync(dataFile, 'utf8');

// Extract the ZIWEI_DATA_P object (it's assigned to a const)
// We'll use a simple regex to find keys at the first level and second level.
// Note: This is a rough parser, assuming standard JSON-like structure in JS file.

const standardPalaces = [
    '命宮', '兄弟', '夫妻', '子女',
    '財帛', '疾厄', '遷移', '交友',
    '事業', '田宅', '福德', '父母'
];
const standardSiHua = ['祿', '權', '科', '忌'];

console.log("Checking ZIWEI_DATA_P keys...");

// Match first level keys: "Key": {
const palaceMatches = content.matchAll(/"([^"]+)":\s*\{/g);
const foundPalaces = new Set();
// We need to track context to know if we are at top level or nested.
// Since regex is stateless, let's just find all keys and see if any look like variants.

// Better approach: regex for palace block, then regex for hua inside.
// Assuming structure:
// "Palace": {
//    "Hua": { ... }
// }

const lines = content.split('\n');
let currentPalace = null;
let errors = [];

lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for Palace keys
    const palaceMatch = trimmed.match(/^"([^"]+)":\s*\{/);
    if (palaceMatch) {
        const key = palaceMatch[1];
        // If it's one of the standard palaces, set current.
        if (standardPalaces.includes(key)) {
            currentPalace = key;
        } else if (key.length === 2 && key !== '祿' && key !== '權' && key !== '科' && key !== '忌' && !standardPalaces.includes(key)) {
            // Heuristic: Palace names are usually 2 chars (except MingGong).
            // If we find a 2-char key at top level that isn't standard, flag it.
            // But wait, "祿", "權" etc are 1 char.
            // Are there any other top level keys? "ZIWEI_DATA_SIHUA_N" starts later.
        }
    }

    // Check for SiHua keys inside Palace blocks
    // They look like "Hua": {  or "Hua": "..."
    const huaMatch = trimmed.match(/^"([^"]+)":/);
    if (huaMatch && currentPalace) {
        const key = huaMatch[1];
        // If it's a 1-char key, it's likely a SiHua.
        if (key.length === 1) {
            if (!standardSiHua.includes(key)) {
                // Check if it's a known variant
                if (key === '禄') errors.push({ line: index + 1, type: 'Variant Lu', context: currentPalace });
                if (key === '权') errors.push({ line: index + 1, type: 'Variant Quan', context: currentPalace });
                if (key === '科' || key === '忌') { /* ok */ }
                // If not standard and not known variant, maybe just ignore or log?
                if (!standardSiHua.includes(key) && key !== '禄' && key !== '权') {
                    // console.log(`Potential unknown key at line ${index+1}: ${key}`);
                }
            }
        }
    }
});

// Also check ZIWEI_DATA_SIHUA_N section
const siHuaNIndex = content.indexOf('const ZIWEI_DATA_SIHUA_N');
if (siHuaNIndex !== -1) {
    console.log("Checking ZIWEI_DATA_SIHUA_N keys...");
    const subContent = content.substring(siHuaNIndex);
    const subLines = subContent.split('\n');
    let subPalace = null;

    subLines.forEach((line, index) => {
        const trimmed = line.trim();
        const palaceMatch = trimmed.match(/^"([^"]+)":\s*\{/);
        if (palaceMatch) {
            const key = palaceMatch[1];
            if (standardPalaces.includes(key)) {
                subPalace = key;
            }
        }

        const huaMatch = trimmed.match(/^"([^"]+)":/);
        if (huaMatch && subPalace) {
            const key = huaMatch[1];
            if (key.length === 1) {
                if (!standardSiHua.includes(key)) {
                    if (key === '禄') errors.push({ line: index + lines.length, type: 'Variant Lu (N)', context: subPalace }); // Rough line calc
                    if (key === '权') errors.push({ line: index + lines.length, type: 'Variant Quan (N)', context: subPalace });
                }
            }
        }
    });
}

if (errors.length > 0) {
    console.log("Found errors:");
    errors.forEach(e => console.log(`Line ${e.line}: ${e.type} in ${e.context}`));
} else {
    console.log("No variant keys found.");
}
