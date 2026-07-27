import { computeItemRevision } from "file:///C:/Users/jainv/workplace/ai-learning-app/src/lib/revisions.ts";

const empty = computeItemRevision([]);
const hole = computeItemRevision(new Array(1));
const hole2 = computeItemRevision(new Array(2));
console.log("[]", empty);
console.log("Array(1)", hole);
console.log("Array(2)", hole2);
console.log("in-domain collision: Array(1) === []", hole === empty);

const body = ["intro", "quiz", "outro"];
const before = computeItemRevision({ beats: body });
delete body[1];
const after = computeItemRevision({ beats: body });
console.log("delete beats[1]: silently accepted, hash", after, "(no throw)");
const explicitUndef = ["intro", undefined, "outro"];
try {
  computeItemRevision({ beats: explicitUndef });
  console.log("explicit undefined: no throw");
} catch (e) {
  console.log("explicit undefined at same index: THREW", e.constructor.name);
}
console.log("hole vs explicit undefined: inconsistent -- hole hashed", after);
