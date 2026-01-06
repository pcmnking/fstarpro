
const fs = require('fs');
const content = fs.readFileSync('assets/js/ziwei_data_P.js', 'utf-8');
// Remove const declaration and semicolon
// We expect: const ZIWEI_DATA_P = { ... };
// We want: { ... }
let jsonContent = content.replace(/const\s+ZIWEI_DATA_P\s*=\s*/, '');
// Remove trailing semicolon if present
jsonContent = jsonContent.trim();
if (jsonContent.endsWith(';')) {
    jsonContent = jsonContent.slice(0, -1);
}

// Eval it? Or simpler: vm.runInNewContext?
// Using eval is easiest for simple object
// However, if the file is large, eval might be fine.
// But wait, if keys are not quoted (valid JS but not JSON), eval handles it.
// If it is strict JSON, JSON.parse works.
// Given previous view, keys ARE quoted.
// Try JSON.parse first. If fails, use eval.

try {
    const data = JSON.parse(jsonContent);
    console.log(JSON.stringify(data, null, 2));
} catch (e) {
    // Fallback to eval
    // Note: eval in strict mode?
    // We can use Function
    try {
        const data = new Function('return ' + jsonContent)();
        console.log(JSON.stringify(data, null, 2));
    } catch (e2) {
        console.error("Error parsing JS:", e2);
        process.exit(1);
    }
}
