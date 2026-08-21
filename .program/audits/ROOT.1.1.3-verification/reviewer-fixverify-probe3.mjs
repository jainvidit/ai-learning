import { computeItemRevision } from "file:///C:/Users/jainv/workplace/ai-learning-app/src/lib/revisions.ts";

function attempt(label, fn) {
  try {
    const r = fn();
    console.log(label, "| RETURNED", JSON.stringify(r));
    return r;
  } catch (e) {
    console.log(label, "| THREW", e.constructor.name, "|", e.message);
    return null;
  }
}

const emptyHash = attempt("empty array", function () { return computeItemRevision([]); });
const holeOnly = new Array(1);
const holeHash = attempt("Array(1) all holes", function () { return computeItemRevision(holeOnly); });
console.log("COLLAPSE: Array(1) hashes same as [] --", emptyHash !== null && emptyHash === holeHash);

const a = [1];
a[2] = 3;
const sparseHash = attempt("sparse 1,hole,3", function () { return computeItemRevision(a); });
const b2 = new Array(3);
b2[0] = 1;
b2[2] = 3;
console.log("same-shape sparse equal --", sparseHash === computeItemRevision(b2));

const trail = [1, 2];
delete trail[1];
attempt("deleted-index array", function () { return computeItemRevision(trail); });

const big = new Array(5);
big[4] = "last";
attempt("leading-holes array", function () { return computeItemRevision(big); });

console.log("explicit undefined element for contrast:");
attempt("[1, undefined, 3]", function () { return computeItemRevision([1, undefined, 3]); });
