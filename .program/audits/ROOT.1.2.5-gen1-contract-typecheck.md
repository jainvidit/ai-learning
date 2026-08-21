# Evidence: ROOT.1.2.5 gen1 — AgentRunner contract block is compile-checkable

**Item:** ROOT.1.2.5 (agent-runner.md interface doc) | **Agent:** implementer-ROOT.1.2.5-gen1 (hardened, attempt 2)
**Artifact under test:** `.program/interfaces/agent-runner.md` — the single ```ts``` member-surface block
**Criterion served:** acceptance criterion 1, second clause — "real and fake satisfy the same compile-time-checked interface" (`execution-layer.md` REQ-EX-04 scenario 2)
**Tool:** repo TypeScript 5.9.3 (`node_modules/.bin/tsc`), `--strict`, `types: []` to exclude unrelated ambient `@types` noise
**Date:** 2026-07-25

The gen0 doc was prose-only, so REQ-EX-04 scenario 2 was unverifiable by inspection.
gen1 enumerates the member surface; this probe establishes empirically that the
enumerated surface (a) type-checks, (b) admits a real-shaped and a fake-shaped
implementation against ONE interface, and (c) actually rejects wrong shapes — so the
pass in (b) is not vacuous.

Method: the ```ts``` block was extracted verbatim from the doc. Its one deferred import
(`TermEvent`, ROOT.2.1's type, whose module location does not exist yet by design) was
replaced with `type TermEvent = unknown` — a STAND-IN, so that only this document's own
declarations are under test. `unknown` is also the strictest possible stand-in: it makes
the negative control's field-access case fail, which is the desired property for an
opaque deferred alias.

---

## Probe A — positive: both implementations satisfy one interface

Extracted contract (`agent-runner-contract.ts`, stand-in import marked):

```ts
// ---------------------------------------------------------------------------
// DEFERRED — NOT DEFINED IN THIS DOCUMENT.
// `TermEvent` is ROOT.2.1's contract (see "Event payload — DEFERRED" below).
// This document names the type and its import site; it defines no variants,
// no fields, and no sequence-number semantics.
// ---------------------------------------------------------------------------
type TermEvent = unknown; // STAND-IN for the deferred import, checking only THIS doc's declarations

/**
 * The single event payload type crossing this seam. Alias only: its shape is
 * ROOT.2.1's to define. Consumers of AgentRunner see this name; ROOT.2.1 owns
 * what it resolves to.
 */
export type AgentRunnerEvent = TermEvent;

/**
 * Opaque session handle. Consumers pass it back in; they do not construct it,
 * parse it, or depend on its representation.
 */
export type AgentSessionRef = { readonly sessionId: string };

/**
 * Run inputs. The FIELD SET is implementation-owned (ROOT.1.4 / ROOT.1.5).
 * This document fixes only the constraints stated under "Interaction contract
 * constraints" and REQ-EX-01 scenario 2 (tool and turn limits originate from
 * server-side content definitions, never from a client request). Where those
 * limits sit in this shape is NOT decided here.
 */
export type AgentRunOptions = { /* implementation-owned */ };

export interface AgentRunner {
  /** Begin a run. Resolves once the session exists and is streamable. */
  start(options: AgentRunOptions): Promise<AgentSessionRef>;

  /** Submit one whole composed prompt to an existing session (REQ-EX-05). */
  submitPrompt(session: AgentSessionRef, prompt: string): Promise<void>;

  /**
   * Subscribe to the session's event stream. Attach-style: `fromSeq` selects
   * where the subscription begins. REPLAY / GAP / LIVE-TAIL SEMANTICS ARE
   * DEFERRED to ROOT.2.1 (REQ-EX-03) — only the member and its signature are
   * contract here.
   */
  attach(session: AgentSessionRef, fromSeq?: number): AsyncIterable<AgentRunnerEvent>;

  /** Halt the run server-side. Idempotent; safe to call on a finished run. */
  stop(session: AgentSessionRef): Promise<void>;
}
```

Consumer probe (`impl-check.ts`):

```ts
// REQ-EX-04 scenario 2 probe: do a REAL-shaped and a FAKE-shaped implementation
// both satisfy the one AgentRunner interface declared in
// .program/interfaces/agent-runner.md, at compile time?
import type { AgentRunner, AgentRunOptions, AgentSessionRef, AgentRunnerEvent } from "./agent-runner-contract";

class RealAgentRunner implements AgentRunner {
  async start(_o: AgentRunOptions): Promise<AgentSessionRef> { return { sessionId: "s1" }; }
  async submitPrompt(_s: AgentSessionRef, _p: string): Promise<void> {}
  attach(_s: AgentSessionRef, _fromSeq?: number): AsyncIterable<AgentRunnerEvent> {
    return (async function* () { /* real: CLI NDJSON -> TermEvent */ })();
  }
  async stop(_s: AgentSessionRef): Promise<void> {}
}

class FakeAgentRunner implements AgentRunner {
  async start(_o: AgentRunOptions): Promise<AgentSessionRef> { return { sessionId: "cassette-1" }; }
  async submitPrompt(_s: AgentSessionRef, _p: string): Promise<void> {}
  attach(_s: AgentSessionRef, _fromSeq?: number): AsyncIterable<AgentRunnerEvent> {
    return (async function* () { /* fake: cassette NDJSON lines -> TermEvent */ })();
  }
  async stop(_s: AgentSessionRef): Promise<void> {}
}

// One consumer, indifferent to which implementation it holds.
const wired: AgentRunner[] = [new RealAgentRunner(), new FakeAgentRunner()];
export async function consume(r: AgentRunner) {
  const s = await r.start({});
  await r.submitPrompt(s, "one whole composed prompt");
  for await (const _ev of r.attach(s, 0)) { /* transport-neutral */ }
  await r.stop(s);
}
export default wired;
```

Command:

```
tsc -p tsconfig.probe.json
  # {noEmit, strict, target ES2022, lib [ES2022], module ESNext,
  #  moduleResolution bundler, types [], skipLibCheck}
  # files: agent-runner-contract.ts, impl-check.ts
```

Result:

```
TSC_EXIT=0
```

No diagnostics. `RealAgentRunner` and `FakeAgentRunner` both satisfy `AgentRunner`; a
single consumer function drives either through `start` -> `submitPrompt` -> `attach`
-> `stop`, and `AgentRunner[]` holds both. REQ-EX-04 scenario 2 is met by the
enumerated surface.

---

## Probe B — negative control: the interface rejects wrong shapes

Without this, Probe A's clean pass could come from an interface too loose to constrain
anything. Source (`negative-control.ts`) — every diagnostic is EXPECTED:

```ts
// NEGATIVE CONTROL: the interface must REJECT a wrong-shaped implementation,
// otherwise the clean pass in impl-check.ts would be vacuous.
// Every error below is EXPECTED. This file must NOT compile.
import type { AgentRunner, AgentRunOptions, AgentSessionRef, AgentRunnerEvent } from "./agent-runner-contract";

// (a) missing member `stop` + keystroke-style member instead of submitPrompt
class MissingAndKeystrokeRunner implements AgentRunner {
  async start(_o: AgentRunOptions): Promise<AgentSessionRef> { return { sessionId: "x" }; }
  async sendKeystroke(_s: AgentSessionRef, _key: string): Promise<void> {}
  attach(_s: AgentSessionRef, _fromSeq?: number): AsyncIterable<AgentRunnerEvent> {
    return (async function* () {})();
  }
}

// (b) transport-specific return type where the contract says async iterable
class SseRunner implements AgentRunner {
  async start(_o: AgentRunOptions): Promise<AgentSessionRef> { return { sessionId: "x" }; }
  async submitPrompt(_s: AgentSessionRef, _p: string): Promise<void> {}
  attach(_s: AgentSessionRef, _fromSeq?: number): Response { return new Response(); }
  async stop(_s: AgentSessionRef): Promise<void> {}
}

// (c) the deferred alias must be OPAQUE: reading a field off an event is not
// something this document licenses.
export async function peek(r: AgentRunner, s: AgentSessionRef) {
  for await (const ev of r.attach(s)) { return ev.type; }
}

export type Unused = [MissingAndKeystrokeRunner, SseRunner];
```

Command:

```
tsc -p tsconfig.negative.json     # same options, lib [ES2022, DOM] so `Response` resolves
```

Result — 3 diagnostics, exactly the three intended, exit 2:

```
negative-control.ts(7,7): error TS2420: Class 'MissingAndKeystrokeRunner' incorrectly implements interface 'AgentRunner'.
  Type 'MissingAndKeystrokeRunner' is missing the following properties from type 'AgentRunner': submitPrompt, stop
negative-control.ts(19,3): error TS2416: Property 'attach' in type 'SseRunner' is not assignable to the same property in base type 'AgentRunner'.
  Type '(_s: AgentSessionRef, _fromSeq?: number | undefined) => Response' is not assignable to type '(session: AgentSessionRef, fromSeq?: number | undefined) => AsyncIterable<unknown>'.
    Property '[Symbol.asyncIterator]' is missing in type 'Response' but required in type 'AsyncIterable<unknown>'.
negative-control.ts(26,48): error TS18046: 'ev' is of type 'unknown'.
TSC_EXIT=2 (nonzero EXPECTED)
```

What each proves about the contract as written:

| Diagnostic | Contract property demonstrated |
|---|---|
| TS2420 (missing `submitPrompt`, `stop`) | The member list is load-bearing: an implementation cannot omit members, and a keystroke-style member does not substitute for `submitPrompt` (REQ-EX-05 scenario 1 is enforced by the surface, not just asserted in prose). |
| TS2416 (`Response` not assignable to `AsyncIterable`) | The surface is transport-agnostic *by construction*: an SSE-specific return type is a compile error, not a style preference (REQ-EX-05 scenario 2). |
| TS18046 (`ev` is `unknown`) | The deferred event alias is genuinely opaque. Nothing in this doc licenses reading a field off an event — the TermEvent shape is ROOT.2.1's to define (acceptance criterion 3 boundary holds under compilation, not merely under reading). |

---

## Scope note

This probe tests the contract block only. It is NOT a claim about `src/**`: no
production code was written or modified by ROOT.1.2.5, whose `file_ownership` is the
single doc `.program/interfaces/agent-runner.md`. The probe `.ts` files were temporary
and were deleted after the run; they are reproduced verbatim above so any reviewer can
re-run both probes from this document alone.
