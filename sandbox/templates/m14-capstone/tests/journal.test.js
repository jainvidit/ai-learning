// tests/journal.test.js — THE SPEC for journal.js. Run: node tests/journal.test.js
// Rule of this repo: fix journal.js to satisfy these cases. Existing cases may
// never be modified or removed; new features ADD cases below.
const { add, list, search } = require("../journal.js");

const cases = [
  ["list() starts empty", () => Array.isArray(list()) && list().length === 0],
  ["add() returns an entry with id and text", () => {
    const e = add("bought coffee beans");
    return e && e.id !== undefined && e.text === "bought coffee beans";
  }],
  ["list() contains the added entry", () =>
    list().length === 1 && list()[0].text === "bought coffee beans"],
  ["list() preserves insertion order", () => {
    add("ran 5k in the rain");
    return list().length === 2 && list()[0].text === "bought coffee beans";
  }],
  ["search() finds matching entries", () => {
    const hits = search("coffee");
    return Array.isArray(hits) && hits.length === 1 && hits[0].text === "bought coffee beans";
  }],
  ["search() is case-insensitive", () => search("COFFEE").length === 1],
  ["search() returns [] when nothing matches", () => search("zebra").length === 0],
];

let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  try {
    ok = fn();
  } catch (err) {
    ok = false;
  }
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
}

if (failed > 0) {
  console.log(`${failed} case(s) failing`);
  process.exit(1);
}
console.log("All cases passing");
