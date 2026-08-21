import {createHash} from "node:crypto"
const L = console["log"]
function h(s) { return createHash("sha256")["update"](s, "utf8")["digest"]("hex")["slice"](0, 16) }
const cases = [
  ["null", 'null', "74234e98afe7498f"],
  ["true", 'true', "b5bea41b6c623f7c"],
  ["n42", '42', "73475cb40a568e8d"],
  ["negzero", '0', "5feceb66ffc86f38"],
  ["hello", '"hello"', "5aa762ae383fbb72"],
  ["emptyobj", '{}', "44136fa355b3678a"],
  ["emptyarr", '[]', "4f53cda18c2baa0c"],
  ["nested", '{"nested":{"array":[1,2,3],"value":42},"title":"Test"}', "90d6116c9bd77072"],
  ["undefkey", '{"a":1}', "015abd7f5cc57a2d"],
  ["pair", '[1,2]', "49a64717d5d4cb19"],
  ["triple", '[1,2,3]', "a615eeaee21de517"]
]
let bad = 0
for (const c of cases) {
  const g = h(c[1])
  if (g !== c[2]) { bad = bad + 1; L("MISMATCH", c[0], g, c[2]) } else { L("MATCH", c[0], g) }
}
L("mismatches", bad)
