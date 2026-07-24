import { fileExists, runNode } from "./common";

/**
 * VERIFIER REGISTRY.
 * A challenge exercise's `verifierId` must match a key in `verifiers` below.
 * Each verifier inspects the learner's sandbox and returns one entry per
 * criterion — descriptions should mirror the exercise's `criteria` array so
 * the UI checklist lines up.
 *
 * Module-authoring agents: use "demo-fix-greet" as the reference pattern.
 * Helpers (fileExists, readFile, fileMatches, readJson, runNode, judgeFile)
 * live in ./common — all take the sandbox dir as first argument and are
 * path-safe.
 */

export interface VerifyResult {
  pass: boolean;
  criteria: { description: string; pass: boolean; detail?: string }[];
}

export type Verifier = (sandboxDir: string) => Promise<VerifyResult>;

export const verifiers: Record<string, Verifier> = {
  /**
   * Reference verifier: the learner must fix greet.js so the sandbox's
   * test.js exits 0 and prints PASS.
   */
  "demo-fix-greet": async (sandboxDir) => {
    const criteria: VerifyResult["criteria"] = [];

    const greetExists = fileExists(sandboxDir, "greet.js");
    criteria.push({
      description: "greet.js exists",
      pass: greetExists,
      detail: greetExists ? undefined : "greet.js not found in the sandbox",
    });

    let testsPass = false;
    let testDetail: string | undefined;
    if (greetExists) {
      const { stdout, stderr, exitCode } = await runNode(sandboxDir, "test.js");
      testsPass = exitCode === 0 && stdout.includes("PASS");
      if (!testsPass) {
        testDetail =
          exitCode !== 0
            ? `test.js exited with code ${exitCode}: ${(stderr || stdout).trim().slice(0, 300)}`
            : `test.js exited 0 but did not print PASS: ${stdout.trim().slice(0, 300)}`;
      }
    } else {
      testDetail = "Skipped — greet.js is missing";
    }
    criteria.push({
      description: "node test.js prints PASS",
      pass: testsPass,
      detail: testDetail,
    });

    return { pass: criteria.every((c) => c.pass), criteria };
  },
};
