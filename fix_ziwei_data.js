const fs = require('fs');

const FILE_PATH = 'e:\\AI\\githup\\fstarpro\\assets\\js\\ziwei_data_P.js';

try {
    let content = fs.readFileSync(FILE_PATH, 'utf8');

    // Regex to match one or more numbers followed by a dot and whitespace, 
    // occurring immediately before a double quote.
    // (\d+\.\s*)+ matches "3." or "3. 4." or "3.4."
    // (?=") ensures it's at the end of the JSON string value.
    const regex = /(\d+\.\s*)+(?=")/g;

    let matchCount = 0;
    // We can count matches to report back
    const newContent = content.replace(regex, (match) => {
        matchCount++;
        return '';
    });

    if (matchCount > 0) {
        fs.writeFileSync(FILE_PATH, newContent, 'utf8');
        console.log(`Successfully removed ${matchCount} trailing numbered items.`);
    } else {
        console.log('No trailing numbered items found to remove.');
    }

} catch (err) {
    console.error('Error processing file:', err);
}
