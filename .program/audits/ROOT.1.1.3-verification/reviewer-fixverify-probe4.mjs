import { computeItemRevision } from "file:///C:/Users/jainv/workplace/ai-learning-app/src/lib/revisions.ts";

function attempt(label, fn) {
  try {
    const r = fn();
    console.log(label, "| RETURNED", JSON.stringify(r));
  } catch (e) {
    console.log(label, "| THREW", e.constructor.name, "|", String(e.message).slice(0, 120));
  }
}

let deep = 0;
for (let i = 0; i < 5000; i++) deep = [deep];
attempt("5000-deep nested array (in-domain)", function () { return computeItemRevision(deep); });
let deep2 = 0;
for (let i = 0; i < 200000; i++) deep2 = [deep2];
attempt("200k-deep nested array", function () { return computeItemRevision(deep2); });

const wide = {};
for (let i = 0; i < 100000; i++) wide["k" + i] = i;
attempt("100k-wide object", function () { return computeItemRevision(wide); });
