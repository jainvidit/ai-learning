const { auditStamp } = require("./utils.js");
const { getOrder } = require("./orders.js");

class ReportError extends Error {}

function dailyReport(ids) {
  try {
    return ids.map((id) => `${auditStamp(new Date())} ${getOrder(id).item}`).join("\n");
  } catch (err) {
    throw new ReportError(`Report failed: ${err.message}`);
  }
}

module.exports = { dailyReport, ReportError };
