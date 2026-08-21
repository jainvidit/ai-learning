const { add, multiply } = require("./mathy.js");

let failures = 0;
function expect(name, actual, expected) {
  if (actual === expected) {
    console.log(`ok - ${name}`);
  } else {
    console.log(`FAIL - ${name}: expected ${expected}, got ${actual}`);
    failures++;
  }
}

expect("add(2, 3)", add(2, 3), 5);
expect("add(10, -4)", add(10, -4), 6);
expect("multiply(3, 4)", multiply(3, 4), 12);

if (failures === 0) {
  console.log("PASS");
} else {
  console.log(`${failures} test(s) failed`);
  process.exit(1);
}
