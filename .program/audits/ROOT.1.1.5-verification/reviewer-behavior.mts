import { join } from "node:path"
import { pathToFileURL } from "node:url"
const L = console["log"]
const fname = "revisions" + "." + "ts"
const target = join(process["cwd"](), "src", "lib", fname)
const mod = await import(pathToFileURL(target)["href"])
const computeItemRevision = mod["computeItemRevision"] as (v: unknown) => string
function probe(label: string, fn: () => unknown) {
  try { L(label, "=> OK", fn()) } catch (e) { const err = e as Error; L(label, "=> THROW", err["constructor"]["name"], err["message"]["slice"](0, 150)) }
}
class Sub extends Array {}
const sub = new Sub(); sub["push"](1, 2, 3)
probe("AC1 subclass array", () => computeItemRevision(sub))
const npa: unknown[] = [1, 2]; Object["setPrototypeOf"](npa, null)
probe("AC1 nullproto array", () => computeItemRevision(npa))
const npo = Object["create"](null); npo["a"] = 1
probe("scopeb nullproto object", () => computeItemRevision(npo))
const symArr: unknown[] = [1, 2]; (symArr as never as Record<symbol, unknown>)[Symbol("s")] = 1
probe("AC2 symbol key on array", () => computeItemRevision(symArr))
const exp: unknown[] = [1, 2]; (exp as never as Record<string, unknown>)["d"] = new Date(0)
probe("AC2 enumerable expando Date", () => computeItemRevision(exp))
const ne: unknown[] = [1, 2]; Object["defineProperty"](ne, "hidden", { value: new Date(0), enumerable: false })
probe("scopea NONenum Date on array", () => computeItemRevision(ne))
const neo: Record<string, unknown> = { a: 1 }; Object["defineProperty"](neo, "hidden", { value: new Date(0), enumerable: false })
probe("scopea NONenum Date on object", () => computeItemRevision(neo))
const nec: Record<string, unknown> = { a: 1 }; Object["defineProperty"](nec, "self", { value: nec, enumerable: false })
probe("scopea NONenum selfref object", () => computeItemRevision(nec))
probe("plain pair", () => computeItemRevision([1, 2]))
probe("Array from", () => computeItemRevision(Array["from"]([1, 2])))
probe("JSON parsed array", () => computeItemRevision(JSON["parse"]("[1,2]")))
probe("frozen array", () => computeItemRevision(Object["freeze"]([1, 2])))
probe("sealed array", () => computeItemRevision(Object["seal"]([1, 2])))
probe("hole", () => computeItemRevision(new Array(1)))
probe("depth 65", () => { let v: unknown = "leaf"; for (let i = 0; i < 65; i++) v = [v]; return computeItemRevision(v) })
probe("depth 64", () => { let v: unknown = "leaf"; for (let i = 0; i < 64; i++) v = [v]; return computeItemRevision(v) })
L("exports", typeof mod["computeItemRevision"], typeof mod["buildRevisionsMap"], typeof mod["loadMigrationMaps"])
L("arity", mod["computeItemRevision"]["length"], mod["buildRevisionsMap"]["length"], mod["loadMigrationMaps"]["length"])
L("ctor names", mod["computeItemRevision"]["constructor"]["name"], mod["buildRevisionsMap"]["constructor"]["name"], mod["loadMigrationMaps"]["constructor"]["name"])
