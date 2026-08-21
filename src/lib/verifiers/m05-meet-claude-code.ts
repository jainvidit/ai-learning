import type { Verifier, VerifyResult } from "./index";
import { fileExists, runNode } from "./common";

export const m05Verifiers: Record<string, Verifier> = {
  "m05-fix-greet": async (sandboxDir) => {
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
