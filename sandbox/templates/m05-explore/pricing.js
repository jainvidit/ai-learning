// Price per unit of each ingredient, in dollars.
const prices = {
  banana: 0.4,
  flour: 0.5,
  sugar: 0.6,
  egg: 0.35,
  lemon: 0.8,
  butter: 1.2,
};

const { recipes } = require("./recipes");

// Cost of a recipe = sum of (units used x price per unit).
function recipeCost(recipe) {
  let total = 0;
  for (const [ingredient, units] of Object.entries(recipe.ingredients)) {
    total += units * prices[ingredient];
  }
  return total;
}

for (const r of recipes) {
  console.log(`${r.name}: $${recipeCost(r).toFixed(2)}`);
}
