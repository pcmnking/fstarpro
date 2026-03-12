const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'assets/js/ziwei_data_P.js');
const fileContent = fs.readFileSync(dataPath, 'utf8');

// Mock browser environment to eval the file
// We need to strip the BOM if present
const cleanContent = fileContent.replace(/^\uFEFF/, '');

// We want to extract the object. 
// Since it is "const ZIWEI_DATA_P = { ... };", we can eval it.
// But we need to handle the potential "const" in eval if we run it in global scope.
// Let's just wrap it in a function or replace const with global assignment.

let data;
try {
    // Remove "const " and assign to a local variable name or global
    // Simplest is to construct a function that returns the object
    const jsPayload = cleanContent.replace('const ZIWEI_DATA_P =', 'return');
    const f = new Function(jsPayload);
    data = f();
    console.log("Successfully loaded ZIWEI_DATA_P.");
} catch (e) {
    console.error("Error parsing ZIWEI_DATA_P.js:", e.message);
    process.exit(1);
}

const expectedPalaces = ['命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '事業', '田宅', '福德', '父母'];
const expectedTrans = ['祿', '權', '科', '忌'];

let issues = [];

// Check Palaces
expectedPalaces.forEach(p => {
    if (!data[p]) {
        issues.push(`Missing Palace Key: ${p}`);
    } else {
        // Check Trans
        expectedTrans.forEach(t => {
            if (!data[p][t]) {
                issues.push(`Missing Trans Key: ${p} -> ${t}`);
            } else {
                // Check Target Palaces inside Trans
                expectedPalaces.forEach(tp => {
                    if (!data[p][t][tp]) {
                        // Try adding '宮' or missing logic? 
                        // The structure is data[Source][Trans][Target] -> String
                        // But app.js logic allows key fallback.
                        // Let's just warn if missing exact match.
                        // issues.push(`Missing Target Key: ${p} -> ${t} -> ${tp}`);
                    }
                });
            }
        });
    }
});

if (issues.length > 0) {
    console.log("Found issues:");
    issues.forEach(i => console.log(i));
} else {
    console.log("All Palace and Trans keys match expected values.");
}

// Log keys for visual inspection
console.log("Palace Keys found:", Object.keys(data));
if (data['命宮']) {
    console.log("Trans Keys for '命宮':", Object.keys(data['命宮']));
}
