import type { Verifier, VerifyResult } from "./index";
import { fileExists, runNode } from "./common";

export const m15Verifiers: Record<string, Verifier> = {
  "m15-tag-audit": async (sandboxDir) => {
    const criteria: VerifyResult["criteria"] = [];

    // Check 1: validator.js exists
    const validatorExists = fileExists(sandboxDir, "validator.js");
    criteria.push({
      description: "validator.js exists in the sandbox",
      pass: validatorExists,
      detail: validatorExists
        ? undefined
        : "validator.js not found - create this file to implement the tag validator",
    });

    if (!validatorExists) {
      // Can't run further checks without the validator
      return { pass: false, criteria };
    }

    // Check 2: Validator passes on clean page
    let passesClean = false;
    let cleanDetail: string | undefined;
    const cleanResult = await runNode(sandboxDir, "validator.js", [
      "page-clean.html",
    ]);
    passesClean = cleanResult.exitCode === 0;

    if (!passesClean) {
      cleanDetail = `validator.js exited with code ${cleanResult.exitCode} on page-clean.html (expected 0). ${
        cleanResult.stderr
          ? `Error: ${cleanResult.stderr.slice(0, 200)}`
          : `Output: ${cleanResult.stdout.slice(0, 200)}`
      }`;
    }

    criteria.push({
      description: "Running validator on page-clean.html exits with code 0 (passes)",
      pass: passesClean,
      detail: cleanDetail,
    });

    // Check 3: Validator fails on broken page
    let failsBroken = false;
    let brokenDetail: string | undefined;
    const brokenResult = await runNode(sandboxDir, "validator.js", [
      "page-broken.html",
    ]);
    failsBroken = brokenResult.exitCode === 1;

    if (!failsBroken) {
      brokenDetail = `validator.js exited with code ${brokenResult.exitCode} on page-broken.html (expected 1). The broken page has issues that should be caught.`;
    }

    criteria.push({
      description: "Running validator on page-broken.html exits with code 1 (fails)",
      pass: failsBroken,
      detail: brokenDetail,
    });

    // Check 4: Validator reports issues on broken page
    let reportsIssues = false;
    let reportDetail: string | undefined;

    if (failsBroken) {
      const output = (brokenResult.stdout + brokenResult.stderr).toLowerCase();
      // Check if output mentions common issues or has error indicators
      const hasErrorIndicators =
        output.includes("gtm") ||
        output.includes("datalayer") ||
        output.includes("error") ||
        output.includes("fail") ||
        output.includes("❌") ||
        output.includes("issue") ||
        output.includes("missing");

      reportsIssues = hasErrorIndicators && output.length > 20;

      if (!reportsIssues) {
        reportDetail =
          "Validator exits with code 1 but doesn't print clear error messages. Output should describe what's wrong.";
      }
    } else {
      reportDetail =
        "Skipped - validator didn't detect the broken page as failing";
    }

    criteria.push({
      description: "Validator reports at least one issue when run on broken page",
      pass: reportsIssues,
      detail: reportDetail,
    });

    return { pass: criteria.every((c) => c.pass), criteria };
  },
};
