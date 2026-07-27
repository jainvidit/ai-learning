import { loadMigrationMaps } from "file:///C:/Users/jainv/workplace/ai-learning-app/src/lib/revisions.ts";

const base = "C:/Users/jainv/workplace/ai-learning-app/.program/audits/ROOT.1.1.3-verification/";

function attempt(label, dir) {
  try {
    const r = loadMigrationMaps(base + dir);
    console.log(label, "| RETURNED", JSON.stringify(r));
  } catch (e) {
    console.log(label, "| THREW", e.constructor.name, "|", e.message);
  }
}

attempt("fx1 empty strings", "fx1");
attempt("fx2 non-hex/wrong-length", "fx2");
attempt("fx3 self-link", "fx3");
attempt("fx4 conflicting duplicate across files", "fx4");
attempt("fx5 extra key", "fx5");
attempt("fx6 null entry", "fx6");
attempt("fx7 empty array", "fx7");
attempt("fx8 same pair diff note across files", "fx8");
attempt("fx9 non-string note", "fx9");
attempt("fx10 nested array", "fx10");
