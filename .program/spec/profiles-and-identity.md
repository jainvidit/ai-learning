# Capability: Profiles & Identity

Passwordless Netflix-style local profiles — a blueprint keep-list item and the Home Edition identity model. (Hosted Better Auth mapping lives in `hosted-edition.md`.)

**Depends on:** none (root capability; per-profile isolation is consumed by `execution-layer.md` REQ-EX-06 and `workshop-and-artifacts.md` REQ-WA-01).
**Depended on by:** `event-log-and-projections.md` (events are per-profile), `dashboard-and-wayfinding.md` (active-profile display), `hosted-edition.md` (Profile shape beneath accounts).
**Contract owner:** kept current-app behavior; owner [HARD] constraints #10, #26.

---

## REQ-PI-01: Passwordless local profiles, per-profile isolation {#req-pi-01}

Multiple named profiles with a name-picker (no accounts, no passwords, no authn/authz — CONSTRAINTS.md #10 [HARD]); per-profile progress persists (CONSTRAINTS.md #11 [HARD]); per-profile isolation covers progress, sandboxes, Workshop dirs, and session keys. Multi-profile is a name-picker, not tenancy (CONSTRAINTS.md #15).

**Source:** DREAM-BLUEPRINT.md §3 "Auth & profiles", §6 keep-list item 6; CONSTRAINTS.md #10, #11.
**Current state (docs/origin/CURRENT-STATE.md):** `src/lib/profiles.ts` + `data/profiles.json` SURVIVES; profile API routes MODIFIED "nearly as-is"; profile picker page MODIFIED (per-track completion %, "Active" badge survives). `data/**` is never-delete.

**Scenarios:**
1. Given the app with no active profile, when opened, then the profile picker appears and selecting a name is the entire "login."
2. Given two profiles, when one completes lessons, then the other's progress, sandboxes, Workshop, and sessions are untouched.
3. Given a profile deletion, when confirmed, then only that profile's data is removed, with UI confirmation first (and event-log/never-delete rules from REQ-EL-01 respected for migration-era data).
4. Given any redesign of navigation, when shipped, then the active profile remains visible (owner [HARD] #26 — sidebar avatar+name and "Active" badge on the picker survive).
