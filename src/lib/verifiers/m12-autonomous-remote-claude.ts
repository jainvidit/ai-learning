import type { Verifier, VerifyResult } from "./index";
import { runNode } from "./common";

export const m12Verifiers: Record<string, Verifier> = {
  "m12-goal-tests-pass": async (sandboxDir) => {
    const criteria: VerifyResult["criteria"] = [];

    const { stdout, stderr, exitCode } = await runNode(sandboxDir, "test.js");

    // Criterion 1: node test.js exits with code 0
    const exitsClean = exitCode === 0;
    criteria.push({
      description: "node test.js exits with code 0",
      pass: exitsClean,
      detail: exitsClean
        ? undefined
        : `test.js exited with code ${exitCode}. Last output: ${(stdout || stderr).trim().slice(-200)}`,
    });

    // Criterion 2: Test output contains no FAIL lines
    const noFailLines = !/^FAIL /m.test(stdout);
    criteria.push({
      description: "Test output contains no FAIL lines",
      pass: noFailLines,
      detail: noFailLines
        ? undefined
        : `Found FAIL lines in output: ${stdout
            .split("\n")
            .filter((line) => line.startsWith("FAIL"))
            .join("; ")}`,
    });

    return { pass: criteria.every((c) => c.pass), criteria };
  },
};
