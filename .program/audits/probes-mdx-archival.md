# Probe: next-mdx-remote archival status
**Date:** 2026-07-25  
**Item:** ROOT.1.7  
**Scope:** ASSUMPTIONS #11 re-verification — is next-mdx-remote still archived/unmaintained upstream?

## Verdict
**NO LONGER ARCHIVED** — The claim recorded at blueprint time is contradicted by current npm registry evidence.

## Evidence
Registry metadata retrieved via `npm view next-mdx-remote --json` on 2026-07-25:

### Key fields
- **Latest version:** 6.0.0
- **Last published:** 2026-02-12T00:15:06.905Z (5 months, 13 days ago from probe date)
- **Last modified:** 2026-02-12T00:15:07.036Z
- **Deprecation notice:** None (checked via `npm view next-mdx-remote deprecated` — no output)
- **Repository:** https://github.com/hashicorp/next-mdx-remote (HashiCorp organization)
- **Active maintainers:** 4 listed
  - dstaley <staley.dylan@gmail.com>
  - rubennic <ruben.niculcea@gmail.com>
  - hashibot-web <mktg-dev-github-bot@hashicorp.com>
  - bkalow <hello@brycekalow.name>
- **npm user (v6.0.0 publisher):** rubennic <ruben.niculcea@gmail.com>
- **Recent canary activity:** 0.0.0-canary-20260211052620 published 2026-02-11T23:50:18.680Z

### Version timeline
- v5.0.0: 2024-05-22
- v6.0.0: 2026-02-12 (major version bump ~20 months later)
- Active canary releases in March 2024, May 2024, and February 2026

## Implication for REQ-CP-01 scenario 3
**The forcing function no longer exists.** REQ-CP-01 states:

> This migration is FORCED — `next-mdx-remote` is archived upstream ([VERIFIED-EXTERNALLY] at blueprint time; docs/origin/ASSUMPTIONS.md #11 says re-verify before Phase 0).

Current evidence shows `next-mdx-remote` is:
1. **Actively maintained** (v6.0.0 published 5 months ago)
2. **Not deprecated** (no npm deprecation flag)
3. **Under active development** (canary releases, major version bump)
4. **Backed by HashiCorp** (organizational support)

### Decision impact
The Velite migration was marked FORCED due to upstream archival. With `next-mdx-remote` now actively maintained and on v6.0.0, the migration becomes **optional** — a technical preference rather than a forced replacement. The blueprint's "external deadline" no longer applies.

**Recommended action:** Elevate to decision authority. The technical trade-offs (Velite build-time compilation vs next-mdx-remote runtime compilation) should be re-evaluated without the archival constraint. OPEN-QUESTIONS.md #10 (Velite vs Content Collections tiebreak) may need revisiting if the forcing function removal makes `next-mdx-remote` viable as a third option or changes the risk calculus.

## Raw registry output
Full JSON output saved in command history:
```bash
cd "C:\Users\jainv\workplace\ai-learning-app" && npm view next-mdx-remote --json
```

Exit fields confirming non-archived status:
- `"time.modified": "2026-02-12T00:15:07.036Z"`
- `"version": "6.0.0"`
- No `"deprecated"` field in package metadata
