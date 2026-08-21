// Daily Quote: prints one quote per day, rotating through the list.
// Run with: node index.js
const { quotes } = require("./quotes");

const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
const pick = quotes[dayNumber % quotes.length];

console.log(`"${pick.text}"`);
console.log(`  — ${pick.author}`);
