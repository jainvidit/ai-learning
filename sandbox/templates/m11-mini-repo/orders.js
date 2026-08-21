const { formatDate } = require("./utils.js");

class OrderNotFoundError extends Error {}

const orders = new Map();

function placeOrder(id, item) {
  orders.set(id, { id, item, placedAt: new Date("2026-01-15T10:00:00Z") });
}

function getOrder(id) {
  const order = orders.get(id);
  if (!order) throw new OrderNotFoundError(`No order ${id}`);
  return { ...order, placedLabel: formatDate(order.placedAt) };
}

module.exports = { placeOrder, getOrder, OrderNotFoundError };
