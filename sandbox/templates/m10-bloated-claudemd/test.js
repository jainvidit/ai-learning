const { createQueue } = require("./queue.js");
const q = createQueue({ name: "test-queue" });
q.push({ id: "1", type: "email", payload: {} });
if (q.size() === 1 && q.pop().id === "1" && q.pop() === null) {
  console.log("PASS");
} else {
  console.log("FAIL");
  process.exit(1);
}
