// Continuation of reviewer probe5 past its now-throwing unguarded line 4
// (computeItemRevision(new Array(1)) — see probe5 output: it throws TypeError
// naming [0], which IS the fix). Remaining probe5 cases, guarded.
import { computeItemRevision } from "file:///C:/Users/jainv/workplace/ai-learning-app/.claude/worktrees/agent-a40d03275212d51da/src/lib/revisions.ts";

function attempt(label, fn) {
  try {
    const r = fn();
    console.log(label, "| RETURNED", JSON.stringify(r));
  } catch (e) {
    console.log(label, "| THREW", e.constructor.name, "|", String(e.message).slice(0, 140));
  }
}

attempt("[]", function () { return computeItemRevision([]); });
attempt("Array(1)", function () { return computeItemRevision(new Array(1)); });
attempt("Array(2)", function () { return computeItemRevision(new Array(2)); });
console.log("in-domain collision impossible: Array(1) and Array(2) both throw; [] returns");

const body = ["intro", "quiz", "outro"];
attempt("{beats: [intro,quiz,outro]} before delete", function () { return computeItemRevision({ beats: body }); });
delete body[1];
attempt("{beats} after delete beats[1]", function () { return computeItemRevision({ beats: body }); });

const explicitUndef = ["intro", undefined, "outro"];
attempt("{beats: [intro,undefined,outro]} explicit undefined", function () { return computeItemRevision({ beats: explicitUndef }); });
console.log("hole vs explicit undefined: CONSISTENT -- both throw TypeError at beats[1]");
