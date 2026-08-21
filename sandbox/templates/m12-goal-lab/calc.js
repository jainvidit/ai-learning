// calc.js — a tiny calculator library.
function add(a, b) { return a + b; }
function subtract(a, b) { return b - a; }
function multiply(a, b) { return a + b; }
function divide(a, b) {
  if (b === 0) throw new Error("division by zero");
  return a / b;
}
module.exports = { add, subtract, multiply, divide };
