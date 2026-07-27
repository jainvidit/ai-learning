// Continuation of reviewer probe3 past its now-throwing unguarded line 25
// (probe3 computed a sparse-array hash without try/catch; the fixed module
// throws there, which IS the fix). Same remaining cases, same attempt() guard.
import { computeItemRevision } from "file:///C:/Users/jainv/workplace/ai-learning-app/.claude/worktrees/agent-a40d03275212d51da/src/lib/revisions.ts";

function attempt(label, fn) {
  try {
    const r = fn();
    console.log(label, "| RETURNED", JSON.stringify(r));
    return r;
  } catch (e) {
    console.log(label, "| THREW", e.constructor.name, "|", String(e.message).slice(0, 140));
    return null;
  }
}

const b2 = new Array(3);
b2[0] = 1;
b2[2] = 3;
attempt("same-shape sparse b2 [1,hole,3]", function () { return computeItemRevision(b2); });

const trail = [1, 2];
delete trail[1];
attempt("deleted-index array", function () { return computeItemRevision(trail); });

const big = new Array(5);
big[4] = "last";
attempt("leading-holes array", function () { return computeItemRevision(big); });

console.log("explicit undefined element for contrast:");
attempt("[1, undefined, 3]", function () { return computeItemRevision([1, undefined, 3]); });
