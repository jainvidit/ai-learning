import { computeItemRevision, buildRevisionsMap, loadMigrationMaps } from "file:///C:/Users/jainv/workplace/ai-learning-app/src/lib/revisions.ts";
import { createHash } from "node:crypto";

function attempt(label, fn) {
  try {
    const r = fn();
    console.log(label, "| RETURNED", JSON.stringify(r));
  } catch (e) {
    console.log(label, "| THREW", e.constructor.name, "|", e.message);
  }
}

console.log("=== F1 replay ===");
attempt("NaN", function () { return computeItemRevision({ score: NaN }); });
attempt("Infinity", function () { return computeItemRevision({ score: Infinity }); });
attempt("negInfinity", function () { return computeItemRevision({ score: -Infinity }); });
attempt("Date nested", function () { return computeItemRevision({ meta: { createdAt: new Date(0) } }); });
attempt("Map", function () { return computeItemRevision({ m: new Map([["a", 1]]) }); });
attempt("Set", function () { return computeItemRevision({ s: new Set([1]) }); });
attempt("function value", function () { return computeItemRevision({ fn: function () {} }); });
attempt("top-level function", function () { return computeItemRevision(function () {}); });
attempt("BigInt", function () { return computeItemRevision({ n: BigInt(9) }); });
attempt("symbol value", function () { return computeItemRevision({ t: Symbol("x") }); });
attempt("top-level undefined", function () { return computeItemRevision(undefined); });
attempt("undefined in array", function () { return computeItemRevision({ beats: [1, undefined] }); });
attempt("toJSON owner", function () { return computeItemRevision({ toJSON: function () { return 1; }, real: 2 }); });
attempt("RegExp", function () { return computeItemRevision({ r: /abc/ }); });
attempt("Uint8Array", function () { return computeItemRevision({ b: new Uint8Array([1, 2]) }); });
attempt("class instance", function () { class Foo { constructor() { this.x = 1; } } return computeItemRevision({ c: new Foo() }); });

const cyc = { a: [{ b: {} }] };
cyc.a[0].b.back = cyc;
attempt("deep cycle", function () { return computeItemRevision(cyc); });
const selfArr = [1];
selfArr.push(selfArr);
attempt("array self-cycle", function () { return computeItemRevision(selfArr); });

console.log("== adversarial pass on NEW code ==");
const sp = [1];
sp[2] = 3;
attempt("sparse array", function () { return computeItemRevision(sp); });
attempt("array 1 null 3", function () { return computeItemRevision([1, null, 3]); });
attempt("boxed Number", function () { return computeItemRevision({ n: new Number(5) }); });
attempt("boxed String", function () { return computeItemRevision({ s: new String("x") }); });
attempt("Proxy over plain", function () { return computeItemRevision(new Proxy({ a: 1 }, {})); });
const ne = { a: 1 };
Object.defineProperty(ne, "hidden", { value: 2, enumerable: false });
console.log("non-enum ignored like JSON --", computeItemRevision(ne) === computeItemRevision({ a: 1 }));
const np = Object.create(null);
np.a = 1;
console.log("null-proto admitted equal --", computeItemRevision(np) === computeItemRevision({ a: 1 }));
const npDeep = Object.create(Object.create(null));
npDeep.a = 1;
attempt("proto-of-proto null (non-plain)", function () { return computeItemRevision(npDeep); });
const symK = {};
symK[Symbol("hidden")] = 1;
attempt("symbol-keyed only", function () { return computeItemRevision(symK); });
console.log("minus-zero normalized --", computeItemRevision({ d: -0 }) === computeItemRevision({ d: 0 }));
console.log("1e21 vs string distinct --", computeItemRevision(1e21) !== computeItemRevision("1e+21"));
attempt("NaN deep path", function () { return computeItemRevision({ beats: [{}, {}, { meta: { score: NaN } }] }); });

console.log("== F3 replay ==");
const m = buildRevisionsMap([{ id: "__proto__", content: { v: 1 } }, { id: "constructor", content: { v: 2 } }]);
console.log("own keys:", JSON.stringify(Object.keys(m)));
console.log("hasOwn proto key:", Object.prototype.hasOwnProperty.call(m, "__proto__"));
console.log("value:", m["__proto__"]);
console.log("Object.prototype clean:", Object.getPrototypeOf({}) === Object.prototype && ({}).v === undefined);
attempt("duplicate proto ids", function () { return buildRevisionsMap([{ id: "__proto__", content: 1 }, { id: "__proto__", content: 2 }]); });

console.log("== F4 replay ==");
attempt("explicit missing dir", function () { return loadMigrationMaps("definitely-not-a-real-dir-xyz"); });
attempt("default dir count", function () { return loadMigrationMaps().length; });

console.log("== pinned-hash independent reproduction ==");
function canon(v) {
  if (v === null) return "null";
  const t = typeof v;
  if (t === "number") return JSON.stringify(Object.is(v, -0) ? 0 : v);
  if (t === "boolean" || t === "string") return JSON.stringify(v);
  if (Array.isArray(v)) {
    const parts = [];
    for (const x of v) parts.push(canon(x));
    return "[" + parts.join(",") + "]";
  }
  const keys = Object.keys(v).sort();
  const parts = [];
  for (const k of keys) {
    if (v[k] !== undefined) parts.push(JSON.stringify(k) + ":" + canon(v[k]));
  }
  return "{" + parts.join(",") + "}";
}
function h(s) { return createHash("sha256").update(s, "utf8").digest("hex").slice(0, 16); }
const pinned = [
  ["null", null, "74234e98afe7498f"],
  ["true", true, "b5bea41b6c623f7c"],
  ["42", 42, "73475cb40a568e8d"],
  ["minus-zero", -0, "5feceb66ffc86f38"],
  ["hello", "hello", "5aa762ae383fbb72"],
  ["emptyObj", {}, "44136fa355b3678a"],
  ["emptyArr", [], "4f53cda18c2baa0c"],
  ["nested", { title: "Test", nested: { value: 42, array: [1, 2, 3] } }, "90d6116c9bd77072"],
  ["beat", { beatId: "m1-l1-b3", type: "quiz", persistent: false, completion: "passed", prompt: "What does 2+2 equal?", choices: ["3", "4", "5"], answerIndex: 1, meta: { skillIds: ["arith.add"], tier: "core" }, nullField: null, emptyArr: [], emptyObj: {} }, "5ac6a2295c26fb46"],
  ["undefValKey", { a: 1, b: undefined }, "015abd7f5cc57a2d"],
];
let allOk = true;
for (const [label, value, expected] of pinned) {
  const independent = h(canon(value));
  const moduleHash = computeItemRevision(value);
  const ok = independent === expected && moduleHash === expected;
  if (!ok) allOk = false;
  console.log("pin", label, "| indep", independent, "| module", moduleHash, "| pinned", expected, "|", ok ? "MATCH" : "MISMATCH");
}
console.log("all pinned reproduced:", allOk);
