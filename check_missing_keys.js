
const fs = require('fs');

const dataFile = 'e:/AI/antigravity/fstar/assets/js/ziwei_data_P.js';
const content = fs.readFileSync(dataFile, 'utf8');

// Extract ZIWEI_DATA_SIHUA_N content block manually
const startMarker = 'const ZIWEI_DATA_SIHUA_N = {';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.log("Error: ZIWEI_DATA_SIHUA_N not found.");
    process.exit(1);
}

// Find the matching closing brace. 
// Since it's a const declaration, we can look for the next const or end of file, 
// or just parse the JS object if possible. But JS objects in files aren't valid JSON (keys unquoted sometimes, trailing commas).
// However, the file content we saw has quoted keys.
// So let's try to extract the block and parse it as JSON after minor cleanup.
// Or just regex check.

const standardPalaces = [
    '命宮', '兄弟', '夫妻', '子女',
    '財帛', '疾厄', '遷移', '交友',
    '事業', '田宅', '福德', '父母'
];
const standardSiHua = ['祿', '權', '科', '忌'];

const lines = content.substring(startIndex).split('\n');
let currentPalace = null;
let palaceCounts = {};

standardPalaces.forEach(p => palaceCounts[p] = new Set());

lines.forEach(line => {
    const trimmed = line.trim();
    const palaceMatch = trimmed.match(/^"([^"]+)":\s*\{/);
    if (palaceMatch) {
        const key = palaceMatch[1];
        if (standardPalaces.includes(key)) {
            currentPalace = key;
        }
    }

    const huaMatch = trimmed.match(/^"([^"]+)":/);
    if (huaMatch && currentPalace) {
        const key = huaMatch[1];
        if (standardSiHua.includes(key)) {
            palaceCounts[currentPalace].add(key);
        }
    }
});

console.log("Missing Keys Report:");
let missingCount = 0;
standardPalaces.forEach(p => {
    const found = palaceCounts[p];
    const missing = standardSiHua.filter(s => !found.has(s));
    if (missing.length > 0) {
        console.log(`${p} is missing: ${missing.join(', ')}`);
        missingCount++;
    }
});

if (missingCount === 0) {
    console.log("All ZIWEI_DATA_SIHUA_N keys differ to standard are accounted for.");
}
