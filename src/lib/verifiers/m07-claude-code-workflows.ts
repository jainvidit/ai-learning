import type { Verifier, VerifyResult } from "./index";
import { fileExists, judgeFile } from "./common";

export const m07Verifiers: Record<string, Verifier> = {
  "m07-claudemd": async (sandboxDir) => {
    const criteria: VerifyResult["criteria"] = [];

    const claudeMdExists = fileExists(sandboxDir, "CLAUDE.md");
    criteria.push({
      description: "CLAUDE.md exists at the top of the project",
      pass: claudeMdExists,
      detail: claudeMdExists ? undefined : "CLAUDE.md not found in the sandbox",
    });

    if (claudeMdExists) {
      const { met, reason } = await judgeFile(
        sandboxDir,
        "CLAUDE.md",
        "The file reads as concise project guidance for an AI assistant: it says what the project is, gives the command(s) to run and/or test it, and states at least one project convention. It is guidance, not an essay — roughly a page or less."
      );
      criteria.push({
        description:
          "CLAUDE.md reads as concise project guidance: what the project is, how to run it, and its conventions",
        pass: met,
        detail: reason,
      });
    } else {
      criteria.push({
        description:
          "CLAUDE.md reads as concise project guidance: what the project is, how to run it, and its conventions",
        pass: false,
        detail: "Skipped — CLAUDE.md is missing",
      });
    }

    return { pass: criteria.every((c) => c.pass), criteria };
  },
};
