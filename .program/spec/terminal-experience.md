# Capability: Terminal Experience

The learner-facing terminal surface: PersistentTerminalHost, the bottom dock, xterm stack, session detachability as a UX feature, and terminal accessibility.

**Depends on:** `execution-layer.md` (sessions, TermEvent protocol, reattach contract), `frontend-platform.md` (tokens; a11y bar), `lesson-experience.md` (persistent beats host portal slots — mutual; the beat contract is lesson-experience REQ-LX-03).
**Depended on by:** `workshop-and-artifacts.md` (Workshop tab + pulsing indicator), `curriculum-content.md` (terminal exercises render here).
**Contract owner:** Nova (dock UX; must not branch on driver); Ramesh (TermEvent parsing — UI never parses raw NDJSON; LANE-DEPENDENCIES "TermEvent protocol" row).

---

## REQ-TX-01: PersistentTerminalHost owns xterm instances {#req-tx-01}

A root-level PersistentTerminalHost owns all xterm instances and portals them into lesson beat slots or the bottom dock. Terminal sessions survive route changes; scrollback restores via `@xterm/addon-serialize`. Stack: @xterm/xterm 6 + fit/webgl/serialize addons, WebGL with context-loss fallback.

**Source:** UX-REVIEW-NOVA.md §4 "Terminal dock"; DREAM-BLUEPRINT.md §7 radar row "Terminal"; GLOSSARY.md "PersistentTerminalHost".
**Current state (docs/origin/CURRENT-STATE.md):** `Terminal.tsx` MODIFIED heavily — xterm rendering survives; instance ownership moves to PersistentTerminalHost via portals; abort-on-unmount REMOVED. `src/app/layout.tsx` MODIFIED — gains PersistentTerminalHost + dock.

**Scenarios:**
1. Given a running terminal in a lesson, when the learner navigates to another route and back, then the same xterm instance (with scrollback) is re-presented — no new session, no lost output.
2. Given a session restored after reattach, when rendered, then scrollback is restored via serialization plus event-log replay for the gap.
3. Given WebGL context loss, when it occurs, then the terminal falls back to a working renderer without losing the session.

## REQ-TX-02: Bottom dock with per-sandbox tabs {#req-tx-02}

The terminal also lives in a bottom dock: per-sandbox tabs, session status, and a pulsing Workshop indicator; sessions outlive pages. Verify stays with the challenge card and deep-links to its beat (never moved into the dock).

**Source:** DREAM-BLUEPRINT.md §2 "Persistent beats", §5 "Key screens"; UX-REVIEW-NOVA.md §4; GLOSSARY.md "Terminal dock".
**Current state:** new UI; layout.tsx gains the dock.

**Scenarios:**
1. Given two sandboxes with sessions, when the dock renders, then each has its own tab with live status.
2. Given a run that finishes while the learner reads elsewhere, when it completes, then the dock indicator pulses (detachability as experience — blueprint §5).
3. Given a challenge whose sandbox session is docked, when the learner wants to verify, then Verify is on the challenge card, which deep-links back to the challenge beat.

## REQ-TX-03: Session detachability is an experience feature {#req-tx-03}

A terminal run started in a lesson continues while the learner reads elsewhere; reattach replays the gap from the event log. (The mechanics are execution-layer REQ-EX-03; this requirement pins the learner-visible behavior.)

**Source:** DREAM-BLUEPRINT.md §5 "Session detachability"; UX-REVIEW-NOVA.md §1 problem 8 [AUDITED] (today's abort-on-unmount is the flagship-killing defect).
**Current state:** fixes the audited problem 8.

**Scenarios:**
1. Given a multi-turn agent run in progress, when the learner navigates away for its duration and returns, then the completed output is fully present with no rerun required.
2. Given the reattach, when observed, then replayed events and live-tail events are visually seamless (ordered, no duplicates).

## REQ-TX-04: Terminal accessibility via TermEvent transcript {#req-tx-04}

xterm's limited `screenReaderMode` is paired with an off-screen live transcript rendered from the structured TermEvent log; `aria-live` streams are throttled. The UI never parses raw NDJSON — it consumes typed TermEvents.

**Source:** DREAM-BLUEPRINT.md §2 "Accessibility bar"; UX-REVIEW-NOVA.md §5 P2-14; LANE-DEPENDENCIES "TermEvent protocol" row.
**Current state:** new a11y layer; TermEvent typing survives from claudeSpawn.ts.

**Scenarios:**
1. Given a streaming session, when a screen reader is active, then an off-screen transcript region announces new events, throttled to avoid flooding.
2. Given the client terminal code, when audited, then it consumes typed TermEvents only (no raw NDJSON parsing in UI).
