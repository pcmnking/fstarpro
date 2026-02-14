
const fs = require('fs');
const dataFile = 'e:/AI/antigravity/fstar/assets/js/ziwei_data_P.js';
const content = fs.readFileSync(dataFile, 'utf8');

const startMarker = 'const ZIWEI_DATA_SIHUA_N = {';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) process.exit(1);

const lines = content.substring(startIndex).split('\n');
let currentPalace = null;
let errors = [];

lines.forEach((line, index) => {
    const trimmed = line.trim();
    // Match Palace key
    const palaceMatch = trimmed.match(/^"([^"]+)":\s*\{/);
    if (palaceMatch) currentPalace = palaceMatch[1];

    // Match SiHua key and value
    const huaMatch = trimmed.match(/^"([^"]+)":\s*"([^"]*)"/); // Value in double quotes
    if (huaMatch && currentPalace) {
        const key = huaMatch[1];
        const val = huaMatch[2];
        if (val.trim() === "") {
            console.log(`Empty value for ${currentPalace} -> ${key}`);
        }

        // Also check if value is "(暫無資料)" or similar placeholder
        if (val.includes("暫無資料")) {
            console.log(`Placeholder value for ${currentPalace} -> ${key}`);
        }
    }
});
