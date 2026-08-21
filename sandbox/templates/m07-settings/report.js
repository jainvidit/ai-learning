// Prints a one-line sales summary. Run with: node report.js
const fs = require("fs");

const sales = JSON.parse(fs.readFileSync("sales.json", "utf8"));
const total = sales.reduce((sum, s) => sum + s.amount, 0);

console.log(`Sales entries: ${sales.length}, total: $${total.toFixed(2)}`);
