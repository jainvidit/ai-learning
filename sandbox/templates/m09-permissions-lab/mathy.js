// A tiny math helper library.
function add(a, b) {
  return a - b; // BUG: should add, not subtract
}

function multiply(a, b) {
  return a * b;
}

module.exports = { add, multiply };
