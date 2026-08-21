// Checks every quote has an author and text. Run with: node test.js
const { quotes } = require("./quotes");

let failures = 0;
for (const q of quotes) {
  if (!q.author || !q.text) {
    console.log("FAIL: quote missing author or text:", JSON.stringify(q));
    failures += 1;
  }
}

if (failures === 0) {
  console.log(`PASS: all ${quotes.length} quotes are valid`);
  process.exit(0);
} else {
  process.exit(1);
}
