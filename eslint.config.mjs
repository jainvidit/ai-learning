import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Agent worktrees (ROOT.7.1 steward batch 1, additive). `.claude/worktrees/**`
    // holds full sibling checkouts of THIS repo, so without this entry `npm run lint`
    // in the shared checkout recursively lints every other agent's copy of the tree
    // (and their `.next` build output), which makes whole-repo lint unusable as a
    // verification baseline. Ignoring the whole of `.claude/**` also covers agent
    // settings files. No file that ships in the app lives under `.claude/`.
    ".claude/**",
  ]),
]);

export default eslintConfig;
