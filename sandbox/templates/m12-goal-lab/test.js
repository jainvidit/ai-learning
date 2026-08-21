// test.js — the spec. Do not modify this file; fix calc.js instead.
const { add, subtract, multiply, divide } = require("./calc.js");

const cases = [
  ["add(2, 3) === 5", () => add(2, 3) === 5],
  ["add(-1, 1) === 0", () => add(-1, 1) === 0],
  ["subtract(10, 4) === 6", () => subtract(10, 4) === 6],
  ["subtract(3, 5) === -2", () => subtract(3, 5) === -2],
  ["multiply(3, 4) === 12", () => multiply(3, 4) === 12],
  ["multiply(6, 0) === 0", () => multiply(6, 0) === 0],
  ["divide(12, 3) === 4", () => divide(12, 3) === 4],
];

let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  try { ok = fn(); } catch { ok = false; }
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
}
if (failed > 0) {
  console.log(`${failed} case(s) failing`);
  process.exit(1);
}
console.log("All cases passing");
