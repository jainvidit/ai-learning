import type { Verifier, VerifyResult } from "./index";
import {
  fileExists,
  fileMatches,
  readJson,
  runNode,
  judgeFile,
} from "./common";

export const m14Verifiers: Record<string, Verifier> = {
  /**
   * Stage 1: CLAUDE.md must exist and be concise/useful
   */
  "m14-claudemd": async (sandboxDir) => {
    const criteria: VerifyResult["criteria"] = [];

    const claudemdExists = fileExists(sandboxDir, "CLAUDE.md");
    criteria.push({
      description: "CLAUDE.md exists",
      pass: claudemdExists,
      detail: claudemdExists
        ? undefined
        : "CLAUDE.md not found in the sandbox root",
    });

    // Only judge quality if file exists
    if (claudemdExists) {
      const { met, reason } = await judgeFile(
        sandboxDir,
        "CLAUDE.md",
        "A concise, useful CLAUDE.md for a small CLI journal project: it states what the project is, the command to run the tests (node tests/journal.test.js), and the working conventions (CommonJS; tests are the spec and must not be edited to pass). It stays under roughly 40 lines and reads as a lean index, not padded documentation."
      );
      criteria.push({
        description:
          "CLAUDE.md is concise and useful: what the project is, its commands, its conventions — under roughly 40 lines",
        pass: met,
        detail: met ? undefined : reason,
      });
    } else {
      criteria.push({
        description:
          "CLAUDE.md is concise and useful: what the project is, its commands, its conventions — under roughly 40 lines",
        pass: false,
        detail: "Skipped — file missing",
      });
    }

    return { pass: criteria.every((c) => c.pass), criteria };
  },

  /**
   * Stage 2: tests/journal.test.js must exit with code 0
   */
  "m14-tests": async (sandboxDir) => {
    const criteria: VerifyResult["criteria"] = [];

    const { stdout, stderr, exitCode } = await runNode(
      sandboxDir,
      "tests/journal.test.js"
    );

    const testsPass = exitCode === 0;
    let detail: string | undefined;
    if (!testsPass) {
      const output = (stderr || stdout).trim();
      detail = `Tests exited with code ${exitCode}. Output: ${output.slice(0, 400)}`;
    }

    criteria.push({
      description:
        "node tests/journal.test.js exits with code 0 (all cases PASS)",
      pass: testsPass,
      detail,
    });

    return { pass: criteria.every((c) => c.pass), criteria };
  },

  /**
   * Stage 3: .claude/skills/journal-entry/SKILL.md must exist and be valid
   */
  "m14-skill": async (sandboxDir) => {
    const criteria: VerifyResult["criteria"] = [];

    const skillExists = fileExists(
      sandboxDir,
      ".claude/skills/journal-entry/SKILL.md"
    );
    criteria.push({
      description: ".claude/skills/journal-entry/SKILL.md exists",
      pass: skillExists,
      detail: skillExists ? undefined : "Skill file not found",
    });

    // Only judge quality if file exists
    if (skillExists) {
      const { met, reason } = await judgeFile(
        sandboxDir,
        ".claude/skills/journal-entry/SKILL.md",
        "A valid skill file: a frontmatter-style header with a name and a description saying when to use it, followed by clear step instructions (validate the entry text, add it, confirm it appears, run the tests) that a fresh session could follow without other context."
      );
      criteria.push({
        description:
          "The file is a valid skill: frontmatter-style name and description, followed by step instructions a fresh session could follow",
        pass: met,
        detail: met ? undefined : reason,
      });
    } else {
      criteria.push({
        description:
          "The file is a valid skill: frontmatter-style name and description, followed by step instructions a fresh session could follow",
        pass: false,
        detail: "Skipped — file missing",
      });
    }

    return { pass: criteria.every((c) => c.pass), criteria };
  },

  /**
   * Stage 4: .claude/settings.json must exist, parse, and contain hooks
   */
  "m14-hook": async (sandboxDir) => {
    const criteria: VerifyResult["criteria"] = [];

    const settingsJson = readJson(sandboxDir, ".claude/settings.json");
    const parses = settingsJson !== null;

    criteria.push({
      description: ".claude/settings.json exists and parses as JSON",
      pass: parses,
      detail: parses
        ? undefined
        : "File missing or invalid JSON — check for syntax errors",
    });

    // Check for hooks key if JSON parses
    let hasHooks = false;
    let hookDetail: string | undefined;

    if (parses && typeof settingsJson === "object" && settingsJson !== null) {
      const settings = settingsJson as Record<string, unknown>;
      const hooks = settings.hooks;

      if (hooks === undefined || hooks === null) {
        hookDetail = "No hooks key found in settings.json";
      } else if (typeof hooks === "object") {
        // Accept both object-keyed-by-event and array shapes
        if (Array.isArray(hooks)) {
          hasHooks = hooks.length >= 1 && hooks.some((h) => h);
          if (!hasHooks) {
            hookDetail = "hooks array is empty or contains no valid entries";
          }
        } else {
          const keys = Object.keys(hooks);
          hasHooks = keys.length >= 1;
          if (!hasHooks) {
            hookDetail = "hooks object is empty";
          }
        }
      } else {
        hookDetail = `hooks key is not an object or array (found: ${typeof hooks})`;
      }
    } else {
      hookDetail = "Skipped — settings.json did not parse";
    }

    criteria.push({
      description:
        "It contains a hooks key with at least one configured hook entry",
      pass: hasHooks,
      detail: hookDetail,
    });

    return { pass: criteria.every((c) => c.pass), criteria };
  },

  /**
   * Stage 5: Tests pass, delete exists, CLAUDE.md is still lean/accurate
   */
  "m14-final": async (sandboxDir) => {
    const criteria: VerifyResult["criteria"] = [];

    // 1. Tests must pass (including delete case)
    const { stdout, stderr, exitCode } = await runNode(
      sandboxDir,
      "tests/journal.test.js"
    );

    const testsPass = exitCode === 0;
    let testDetail: string | undefined;
    if (!testsPass) {
      const output = (stderr || stdout).trim();
      testDetail = `Tests exited with code ${exitCode}. Output: ${output.slice(0, 400)}`;
    }

    criteria.push({
      description:
        "node tests/journal.test.js exits with code 0 (all cases PASS, including at least one for delete)",
      pass: testsPass,
      detail: testDetail,
    });

    // 2. journal.js must contain a delete function
    const journalExists = fileExists(sandboxDir, "journal.js");
    const hasDelete =
      journalExists && fileMatches(sandboxDir, "journal.js", /delete/i);

    criteria.push({
      description: "journal.js contains a delete function",
      pass: hasDelete,
      detail: hasDelete
        ? undefined
        : journalExists
          ? "journal.js exists but does not contain 'delete'"
          : "journal.js not found",
    });

    // 3. CLAUDE.md is still lean and accurate
    const claudemdExists = fileExists(sandboxDir, "CLAUDE.md");
    if (claudemdExists) {
      const { met, reason } = await judgeFile(
        sandboxDir,
        "CLAUDE.md",
        "This CLAUDE.md is still lean (roughly under 40 lines, an index not an encyclopedia) and still accurate for the project as it now stands: a CLI journal library with add, list, search, and delete, tested via node tests/journal.test.js. It must not contain statements that are now false (such as a function list omitting delete while claiming to be complete) and must not have bloated into full API documentation."
      );
      criteria.push({
        description:
          "CLAUDE.md is still lean and still accurate after all five stages of changes",
        pass: met,
        detail: met ? undefined : reason,
      });
    } else {
      criteria.push({
        description:
          "CLAUDE.md is still lean and still accurate after all five stages of changes",
        pass: false,
        detail: "CLAUDE.md not found — it should exist from stage 1",
      });
    }

    return { pass: criteria.every((c) => c.pass), criteria };
  },
};
