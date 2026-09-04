# Known issues

This file records confirmed or intentionally deferred repository issues that
were not addressed in the current review. It is not a substitute for fixing a
defect; update or remove an entry when its status changes.

## Open items

### KI-001 — Help workflow is duplicated

- Priority: P2
- Area: Documentation / maintainability
- Locations: `src/cli/help.mjs`, `docs/quick-start.md`
- Status: Open
- Description: The owner workflow is maintained both in the CLI help string and
  in the quick-start document. A future workflow change can drift between the
  two copies.
- Follow-up: Extract the shared workflow text into one maintained source and
  generate or consume it from both surfaces without changing the public help
  text contract.

### KI-002 — Formatting validation excludes Markdown

- Priority: P2
- Area: Tooling
- Location: `package.json` (`format` and `format:check` scripts)
- Status: Open
- Description: Prettier checks `bin`, `src`, and `tests`, but not README,
  `docs/`, or `specs/`. Markdown formatting can therefore drift without being
  caught by the repository formatting gate.
- Follow-up: Decide whether Markdown formatting is part of the project gate;
  if it is, add the approved Markdown paths to both scripts and validate the
  resulting diff.

### KI-003 — Live provider review is not a local deterministic validation gate

- Priority: P2
- Area: Validation
- Status: Open
- Description: Local validation covers the request builders, tool schemas,
  response validators, filesystem behavior, and injected provider paths. It
  does not prove behavior against a live OpenAI response or every supported
  model and effort level.
- Follow-up: Run an authorized live review separately when provider behavior
  or model compatibility needs verification; do not make credentials or live
  network calls part of the normal test suite.

## Review disposition

No additional confirmed correctness, security, reliability, or data-loss
defects were found by the local review. `npm test`, lint, formatting, packing,
and diff checks passed. Pure barrel Istanbul annotations remain because they
are permitted by the repository convention; no new annotations were added.
