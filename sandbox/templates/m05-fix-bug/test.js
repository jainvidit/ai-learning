// Checks that greet() greets people by their actual name.
const { greet } = require("./greet");

const result = greet("Ada");
const expected = "Hello, Ada!";

if (result === expected) {
  console.log("PASS: greet(\"Ada\") returned \"" + result + "\"");
  process.exit(0);
} else {
  console.log("FAIL: expected \"" + expected + "\" but got \"" + result + "\"");
  process.exit(1);
}
