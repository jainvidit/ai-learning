const { greet } = require("./greet.js");

const result = greet("Ada");
if (result === "Hello, Ada!") {
  console.log("PASS");
  process.exit(0);
} else {
  console.log("FAIL: got " + result);
  process.exit(1);
}
