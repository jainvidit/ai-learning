// Utility grab-bag. NOTE: date formatting is duplicated three ways below.
function formatDate(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function shipmentLabel(d) {
  // duplicate #2 of the same formatting idea
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `Ships ${y}-${m}-${day}`;
}

function auditStamp(d) {
  // duplicate #3, slightly different again
  return "[" + d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate() + "]";
}

class ValidationError extends Error {}

function requireString(value, name) {
  if (typeof value !== "string") throw new ValidationError(`${name} must be a string`);
  return value;
}

module.exports = { formatDate, shipmentLabel, auditStamp, ValidationError, requireString };
