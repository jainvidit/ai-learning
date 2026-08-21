# TaskPipe — CLAUDE.md

TaskPipe is a small Node.js task-queue library. Tasks are JSON objects pushed
onto a queue and consumed by workers. Run tests with `node test.js`.

## API Reference

### createQueue(options)
Creates a new queue. Options:
- `name` (string, required): queue identifier, lowercase letters and dashes.
- `maxSize` (number, default 1000): maximum queued tasks before push() throws.
- `retryLimit` (number, default 3): attempts before a task is dead-lettered.
- `backoffMs` (number, default 250): base delay between retries, doubled each attempt.
Returns a Queue instance.

### queue.push(task)
Adds a task. The task object must include:
- `id` (string): unique, caller-generated. Use crypto.randomUUID().
- `type` (string): one of "email", "webhook", "report".
- `payload` (object): type-specific data, must be JSON-serializable.
Throws QueueFullError if maxSize is reached.
Throws ValidationError if required fields are missing.

### queue.pop()
Removes and returns the oldest task, or null if the queue is empty.
Tasks popped but not acknowledged within 30 seconds are re-queued.

### queue.ack(taskId)
Acknowledges successful processing. Unacked tasks are retried up to
retryLimit times, after which they move to the dead-letter queue.

### queue.deadLetters()
Returns an array of dead-lettered tasks. Inspect these during debugging;
they usually indicate a handler bug rather than bad task data.

### queue.size()
Returns the current number of queued (unpopped) tasks.

### Worker(queue, handlers)
Constructs a worker bound to a queue. `handlers` maps task type to an
async function receiving the payload. Unknown task types are dead-lettered
immediately. Call worker.start() to begin polling and worker.stop() for
graceful shutdown; stop() waits for the in-flight task to finish.

### Events
Queue instances are EventEmitters. Events: "push", "pop", "ack",
"retry" (task, attempt), "dead-letter" (task, error). Handlers must not
throw; wrap event handler bodies in try/catch.

## Style Guide

- Use two-space indentation in all JavaScript files. Never tabs.
- Use const by default, let only when reassignment is required, never var.
- Prefer early returns over nested if/else pyramids.
- Every exported function needs a JSDoc block with @param and @returns.
- Private helpers are prefixed with an underscore and never exported.
- Error classes live in errors.js and extend TaskPipeError.
- Always throw error INSTANCES, never strings: throw new ValidationError(...).
- Test files mirror source files: queue.js is tested by test/queue.test.js.
- Test names read as sentences: "re-queues a task popped but never acked".
- No external runtime dependencies. Dev dependencies are allowed.
- Line length is capped at 100 characters, comments included.
- Prefer async/await over raw promise chains; never mix the two styles
  in one function.
- Commit messages: imperative mood, lowercase, no trailing period, body
  wrapped at 72 characters explaining WHY not WHAT.
- Public API changes require a corresponding entry under "Unreleased" in
  the changelog section below before merging.

## Changelog

### Unreleased
- Add queue.peek() returning the oldest task without removing it.

### 0.9.2 — 2025-11-30
- Fix: worker.stop() no longer drops the in-flight task on shutdown.
- Fix: backoff timer cleared correctly when a task is acked mid-retry.
- Docs: clarified ack timeout semantics in the API reference.

### 0.9.1 — 2025-10-14
- Fix: QueueFullError message now includes the queue name and maxSize.
- Perf: pop() is O(1) again after the ring-buffer regression in 0.9.0.

### 0.9.0 — 2025-09-02
- BREAKING: createQueue() now requires options.name; anonymous queues
  are no longer supported.
- Add dead-letter queue and queue.deadLetters().
- Add "retry" and "dead-letter" events.
- Increase default retryLimit from 2 to 3.

### 0.8.3 — 2025-07-19
- Fix: tasks with numeric ids were silently coerced to strings.
- Docs: added Worker graceful-shutdown example.

### 0.8.2 — 2025-06-05
- Fix: event handler exceptions no longer crash the polling loop.

### 0.8.1 — 2025-05-21
- Perf: JSON validation is skipped for payloads under 1 KB.
- Docs: style guide expanded with commit message conventions.

### 0.8.0 — 2025-04-30
- Add Worker class with handler routing and graceful stop().
- Add queue.size().
- Deprecate queue.length property (use size()).

## Notes for AI assistants

Read the entire style guide above before writing any code. All API
behavior is documented in the API reference section. When adding a
feature, update the changelog. When in doubt about queue semantics,
re-read the API reference rather than guessing.
