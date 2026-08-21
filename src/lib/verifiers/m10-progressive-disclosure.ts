import type { Verifier, VerifyResult } from "./index";
import { fileExists, readFile, listFiles, judgeFile } from "./common";

export const m10Verifiers: Record<string, Verifier> = {
  "m10-lean-claudemd": async (sandboxDir) => {
    const criteria: VerifyResult["criteria"] = [];

    // Criterion 1: CLAUDE.md exists and is at most 40 lines
    const claudemdExists = fileExists(sandboxDir, "CLAUDE.md");
    if (!claudemdExists) {
      criteria.push({
        description: "CLAUDE.md exists and is at most 40 lines",
        pass: false,
        detail: "CLAUDE.md does not exist",
      });
    } else {
      const content = readFile(sandboxDir, "CLAUDE.md");
      const lineCount = content ? content.split("\n").length : 0;
      const passes = lineCount > 0 && lineCount <= 40;
      criteria.push({
        description: "CLAUDE.md exists and is at most 40 lines",
        pass: passes,
        detail: passes
          ? `CLAUDE.md has ${lineCount} lines`
          : `CLAUDE.md has ${lineCount} lines (exceeds 40-line budget)`,
      });
    }

    // Criterion 2: CLAUDE.md links to at least 2 files under docs/
    const claudemdContent = readFile(sandboxDir, "CLAUDE.md");
    if (!claudemdContent) {
      criteria.push({
        description: "CLAUDE.md links to at least 2 files under docs/",
        pass: false,
        detail: "CLAUDE.md not found or unreadable",
      });
    } else {
      const docsLinkPattern = /docs\/[\w-]+\.md/g;
      const matches = claudemdContent.match(docsLinkPattern) || [];
      const uniqueLinks = new Set(matches);
      const passes = uniqueLinks.size >= 2;
      criteria.push({
        description: "CLAUDE.md links to at least 2 files under docs/",
        pass: passes,
        detail: passes
          ? `Found ${uniqueLinks.size} unique docs/ links: ${Array.from(uniqueLinks).join(", ")}`
          : `Found only ${uniqueLinks.size} unique docs/ link(s) — need at least 2`,
      });
    }

    // Criterion 3: docs/ contains at least 2 markdown files
    const docsFiles = listFiles(sandboxDir, "docs");
    const mdFiles = docsFiles.filter((f) => f.endsWith(".md"));
    const passes3 = mdFiles.length >= 2;
    criteria.push({
      description: "docs/ contains at least 2 markdown files with the relocated content",
      pass: passes3,
      detail: passes3
        ? `docs/ contains ${mdFiles.length} markdown file(s): ${mdFiles.join(", ")}`
        : mdFiles.length === 0
        ? "docs/ directory is empty or doesn't exist"
        : `docs/ contains only ${mdFiles.length} markdown file — need at least 2`,
    });

    // Criterion 4: Judge check - CLAUDE.md reads as an index
    const judgeResult = await judgeFile(
      sandboxDir,
      "CLAUDE.md",
      "CLAUDE.md reads as a concise index that points to detail files rather than inlining them: it should contain a short project description, key commands, and links or references to docs files — not a full API reference, full style guide, or changelog entries."
    );
    criteria.push({
      description: "CLAUDE.md reads as a concise index pointing to detail files, not inlining them",
      pass: judgeResult.met,
      detail: judgeResult.reason,
    });

    return {
      pass: criteria.every((c) => c.pass),
      criteria,
    };
  },
};
