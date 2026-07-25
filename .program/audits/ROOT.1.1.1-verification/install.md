# ROOT.1.1.1 -- npm install (gen1)

Run 2026-07-25 by `implementer-ROOT.1.1.1-gen1` in git worktree
`C:\Users\jainv\workplace\ai-learning-app\.claude\worktrees\agent-aa6fa42c34751a5cc`.

Precondition re-verified on disk before editing (the gen1 brief required NOT assuming the
recorded partial state): `package.json` contained `"next-mdx-remote": "^6.0.0"`, there was
NO `velite.config.ts`, and the worktree had no `node_modules` of its own. The gen0 WIP
described in the item file's "Partial state at block" had indeed been reverted.

Command: `npm install` (after the package.json swap: `next-mdx-remote` removed,
`velite ^0.4.0` added as a devDependency)
Exit code: 0

```
added 651 packages, and audited 652 packages in 50s

249 packages are looking for funding
  run `npm fund` for details

13 high severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

NOTE ON THE AUDIT WARNINGS: the 13 high-severity advisories arrive with Velite's own
dependency subtree (it pulls `sharp`, `terser`, `esbuild`, `@mdx-js/mdx`). No
`npm audit fix` was run: it is a dependency-tree mutation beyond this item's file
ownership, and REQ-CP-01 already records Velite's supply-chain risk as accepted
eyes-open (ADR-0009, solo maintainer / internal Zod 3). Flagged for the coordinator
rather than self-authorized.

## Installed-state assertions

```
$ node -p "require('./node_modules/velite/package.json').version"
0.4.0

$ ls node_modules/next-mdx-remote
ls: cannot access 'node_modules/next-mdx-remote': No such file or directory
```

Velite resolved to **0.4.0**, not the `^0.2.0` recorded in the gen0 inventory. Registry
state checked empirically: `npm view velite dist-tags` reports
`{ next: '1.0.0-alpha.3', latest: '0.4.0' }`. The `latest` line (0.4.0) was taken rather
than the `next` alpha.
