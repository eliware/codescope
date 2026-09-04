# Atomic module decomposition plan

This plan is stricter than the validator’s line limits. The goal is not merely
to make files shorter. Every production module must have one reason to change,
one coherent contract, and one focused mirrored test. An orchestrator is valid
only when orchestration is its sole responsibility; policy, parsing,
validation, I/O, formatting, and lifecycle decisions belong in leaf modules or
sub-orchestrators.

No monolith exemptions are authorized. No Istanbul ignores are authorized
outside pure re-export barrels. Passing tests with exemptions, proxy tests, or
duplicated suites does not count as completion.

## Definition of done

- Every source module has one responsibility and a focused mirrored test.
- Every test module tests one source responsibility and stays under the test
  limit without proxy-importing another suite.
- Public root files are intentional, documented re-export barrels with small
  export-surface tests, or are removed in favor of one canonical entrypoint.
- CLI parsing, dispatch, exit status, provider access, response validation,
  evidence collection, formatting, and filesystem traversal are separate.
- No source/test mapping drift or monolith remains.
- No coverage ignore hides executable logic.
- Strict `eliware-test` passes without architecture or coverage exemptions,
  followed by npm test, lint, pack, format checking, and diff checking.

## Target architecture

### Public boundaries

Keep only deliberate public boundaries:

- `bin/codescope.mjs`: process wiring only.
- `src/cli.mjs`: CLI export barrel only.
- `src/combine-*.mjs` and `src/find-*.mjs`: public operation barrels only.
- `src/prompt.mjs`: public prompt/profile barrel only.
- `src/review*.mjs`: retain only as documented public barrels; otherwise
  consolidate them into one canonical review API.
- `src/pricing.mjs` and `src/benchmark-status.mjs`: public barrels only.

Each retained barrel gets a tiny export-surface test. A barrel test must not
import and execute an unrelated large suite.

### CLI

`src/cli/args.mjs` currently combines token extraction, option validation,
profile validation, command grammar, timeout parsing, and compatibility rules.
Split it into:

- `argv-tokens.mjs`: classify raw tokens and preserve ordering.
- `option-values.mjs`: parse one option family and reject duplicates.
- `test-timeout-option.mjs`: validate timeout values.
- `command-grammar.mjs`: legal command shapes.
- `parse-meta.mjs`: help/version.
- `parse-review.mjs`: grouped review commands.
- `parse-suggest.mjs`: grouped suggestion commands.
- `parse-profile.mjs`: direct profile commands.
- `args.mjs`: parser orchestration only.

`src/cli/main.mjs` currently combines defaults, output, prompt execution,
profile routing, validation, and exit status. Split it into:

- `dependencies.mjs`: injectable defaults.
- `dispatch-meta.mjs`: help/version.
- `dispatch-prompt.mjs`: custom prompt.
- `dispatch-profile.mjs`: profile lookup and invocation.
- `validate-result.mjs`: result contracts.
- `status-result.mjs`: verdict to exit code.
- `error-handler.mjs`: error rendering and classification.
- `main.mjs`: dispatch orchestration only.

Move `tests/cli/commands.test.mjs` into focused parser, dispatcher, prompt,
status, and error suites; do not copy the existing cases.

### Finder and combine

Make the finder boundaries explicit:

- `root-policy.mjs`: root/platform validation.
- `read-entries.mjs`: directory I/O.
- `entries.mjs`: entry-name validation.
- `entry-types.mjs`: file/directory classification.
- `extensions.mjs`: extension and test matching.
- `policies.mjs`: ignored-directory policy.
- new `walk.mjs`: traversal state only.
- `files.mjs`: traversal orchestration and ordering only.

Keep combine responsibilities separate:

- `package-json.mjs`: package section.
- `configs.mjs`: bounded `.github`/`.knit` content.
- `other-files.mjs`: inventory metadata.
- `selected.mjs`: selected-file orchestration.
- `read-file.mjs`: one-file read and accounting.
- `section-format.mjs`: section formatting.
- `limits.mjs`: size/concurrency arithmetic.
- `policies.mjs`: option validation.
- `files.mjs`: extension-specific orchestration.
- `all.mjs`: output ordering only.

If `all.mjs` still contains selection, reading, formatting, or limit policy,
extract `all-order.mjs`, `all-selection.mjs`, and `all-output.mjs`.

### Profiles and prompts

Separate data, routing, policy, and construction:

- `profiles/metadata.mjs`: declarative profile metadata.
- `profiles/source-selection.mjs`: source selection.
- `profiles/prompt-routing.mjs`: profile routing.
- `profiles/index.mjs`: lookup orchestration.
- `prompts/categories.mjs`: category constants.
- `prompts/tool-schemas.mjs`: JSON schemas.
- `prompts/guidance.mjs`: shared guidance.
- profile-specific prompt modules: profile composition only.
- `prompts/policy.mjs`: policy composition only.
- `prompt.mjs`: public assembly only.

Split `policy.mjs` into:

- `prompts/policy/identity.mjs`
- `known-issues.mjs`
- `priorities.mjs`
- `evidence.mjs`
- `ignore-guidance.mjs`
- `verdict.mjs`
- `scope.mjs`

Each fragment gets a focused test; composition tests verify ordering and
inclusion only. Move `tests/prompts/index.test.mjs` into tests for the actual
prompt modules it exercises.

### Response handling

Separate provider extraction from domain validation:

- `response/calls.mjs`: locate tool calls.
- `response/exact-keys.mjs`: exact-key predicate.
- `response/categories.mjs`: category rules.
- `response/validators.mjs`: shape validation.
- `response/review-parser.mjs`: review payload parsing.
- `response/suggestion-parser.mjs`: suggestion parsing.
- `response/combined-parser.mjs`: combined-call parsing.
- `response/errors.mjs`: typed response errors.
- `response/review-response.mjs`: public barrel.

Move `tests/response/review-response.test.mjs` into focused parser, category,
exact-key, call-count, and error-contract suites.

### Review lifecycle

`src/review/lifecycle.mjs` currently owns setup, environment, test evidence,
combination, request construction, provider execution, parsing, output, usage,
fallback, signals, and cleanup. It must become a coordinator only.

Target leaves and sub-orchestrators:

- `defaults.mjs`: default collaborators.
- `options.mjs`: option validation.
- `setup-environment.mjs`: environment and token resolution.
- `test-evidence-runner.mjs`: execute tests.
- `test-evidence-policy.mjs`: classify test evidence.
- `source-assembly.mjs`: invoke the combiner.
- `request-builder.mjs`: build provider request.
- `provider-runner.mjs`: one provider request.
- `signal-scope.mjs`: signal ownership.
- `result-parser.mjs`: provider output to domain result.
- `usage-result.mjs`: usage and cost.
- `output-writer.mjs`: successful output.
- `failure-writer.mjs`: invalid/incomplete output.
- `review-session.mjs`: one review phase sub-orchestrator.
- `lifecycle.mjs`: phase ordering only.

Existing `config`, `environment`, `request`, `provider-request`,
`provider-result`, `output`, `failure`, `usage`, `signals`, `cleanup`, and
`test-*` files should either become these exact leaf responsibilities or be
removed/renamed. No two modules may own the same phase.

Move `tests/review/lifecycle.test.mjs` into setup, evidence, request, provider,
result, output, failure, signal, cleanup, and orchestration suites. The final
lifecycle suite tests only phase ordering and collaborator handoff.

### Pricing and benchmark

- `pricing/models.mjs`: model price table.
- `pricing/usage-normalizer.mjs`: usage shape.
- `pricing/thresholds.mjs`: threshold/multiplier policy.
- `pricing/calculator.mjs`: arithmetic only.
- `benchmark/runner.mjs`: process execution.
- `benchmark/summary.mjs`: incremental persistence.
- `benchmark/format.mjs`: report formatting.
- `benchmark/status.mjs`: result classification.

Public pricing/benchmark files remain barrels with focused tests.

## Test architecture

Every moved source responsibility gets its own test module. Shared fixtures
must be narrowly named and must not become a universal setup layer. Root tests
must be intentional barrel tests, never compatibility proxies. Tests should
exercise contracts at the nearest leaf and reserve integration tests for
orchestration handoffs.

## Refactoring sequence

1. Establish canonical public barrels and canonical source/test paths.
2. Decompose and remap CLI parsing and dispatch.
3. Decompose response parsing and validation.
4. Decompose prompt policy and composition.
5. Decompose review lifecycle into leaves and sub-orchestrators.
6. Finish finder, combine, pricing, and benchmark boundaries.
7. Move tests with each slice; never duplicate tests for mapping.
8. Remove obsolete modules and compatibility aliases after imports migrate.
9. Run focused tests after each slice.
10. Run strict `eliware-test` with no exemptions and resolve every mapping,
    monolith, coverage, and lint result.
11. Run full repository validation only after strict architecture validation
    is clean.

Completion is architectural: no module has two independent reasons to
change, no orchestrator owns leaf policy, and no test suite proxies another.

## Progress

- [x] Extract CLI option values and timeout parsing into focused modules.
- [x] Extract grouped and direct profile parsing into focused modules.
- [x] Extract CLI metadata dispatch and result-status mapping.
- [x] Separate response tool-argument parsing, review parsing, suggestion
  parsing, and combined-call parsing.
- [x] Split shared prompt policy into identity, contract, priority, and verdict
  responsibilities.
- [x] Split priority policy into independent P0/P1 and P2/P3 policy modules.
- [x] Extract review defaults, environment/token setup, and evidence assembly
  from the lifecycle coordinator.
- [x] Extract provider execution, response parsing, output, fallback, usage,
  and test-verdict handling into the review-session sub-orchestrator.
- [x] Extract request preparation and custom-prompt/model application from the
  review lifecycle coordinator.
- [x] Add focused mirrored tests for the new CLI, response, policy, setup, and
  evidence leaves.
- [x] Add intentional export-contract tests for the public root barrels.
- [x] Remove the orphan prompt index suite after its focused coverage was
  represented by the existing prompt-module tests.
- [x] Split the response adapter coverage into focused parser, routing, and
  validation contract tests.
- [x] Finish CLI dispatch decomposition and mirrored mapping/tests.
- [x] Finish response validation/error mapping checks.
- [x] Finish prompt composition tests and mirrored mapping.
- [x] Decompose provider execution, result handling, output, usage, failure,
  signal, and cleanup orchestration into review-session leaves.
- [x] Reduce the lifecycle integration suite to orchestration-only coverage.
- [x] Extract finder traversal state into `find/walk.mjs`.
- [x] Extract combine batch scheduling and limit accounting into
  `combine/batches.mjs`.
- [x] Separate pricing models, thresholds, and usage normalization from
  pricing arithmetic.
- [x] Separate benchmark process execution and summary persistence from the
  benchmark entry script.
- [x] Finish remaining finder, combine-all, and benchmark profile-routing
  boundaries; `find/files.mjs`, `combine/files.mjs`, `combine/all.mjs`, and
  the benchmark script now retain orchestration only while traversal, section
  collection, batching, process execution, and summary persistence live in
  dedicated modules.
- [x] Remove all remaining mapping drift and proxy/orphan suites.
- [x] Pass strict architecture validation with no exemptions (source/test
  mapping, monolith limits, tests, coverage, and lint are clean).
