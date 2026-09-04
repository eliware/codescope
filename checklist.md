# Single-responsibility decomposition commit plan

Baseline rollback commit: `68b94de6090cef4efc18bebe83b51129882d8486`

- [x] `5b85cb2` — Create mirrored responsibility directories under `src/` and `tests/`.
- [x] `b0276b5` — Move benchmark status behavior and its test into the mirrored benchmark hierarchy.
- [ ] — Inventory every production module and finalize its one-to-one source/test mapping.
- [ ] — Decompose CLI constants, version, errors, options, arguments, help, output, commands, dispatch, and main orchestration with mirrored tests.
- [ ] — Decompose profile metadata, names, source selection, prompt routing, categories, tools, and profile building with mirrored tests.
- [ ] — Decompose prompt categories, schemas, global guidance, builders, review prompts, suggestion prompts, and priority prompts with mirrored tests.
- [ ] — Decompose file discovery into root/platform handling, entries, symlink policy, exclusions, extensions, test matching, containment, traversal, and finder orchestration with mirrored tests.
- [ ] — Decompose source combination into reads, batching, limits, numbering, normalization, headers, and orchestration with mirrored tests.
- [ ] — Decompose aggregate combination into package metadata, config discovery/content, source groups, inclusion tracking, inventory, metadata, binary detection, truncation, sections, and orchestration with mirrored tests.
- [ ] — Decompose configuration loading into paths, dotenv parsing, environment merging, and config security with mirrored tests.
- [ ] — Decompose request construction into input, tools, reasoning, model, options, and orchestration with mirrored tests.
- [ ] — Decompose response handling into errors, tool calls, arguments, exact keys, categories, issue items, suggestion items, review results, and combined results with mirrored tests.
- [ ] — Decompose the review lifecycle into test execution/output/redaction, environment/config checks, client creation, signals, dry runs, plain text, structured review, usage, failures, and orchestration with mirrored tests.
- [ ] — Review pricing and retain one responsibility or split rates, thresholds, calculation, and formatting with mirrored tests.
- [ ] — Convert remaining flat public modules into thin adapters or pure re-export barrels with adapter tests.
- [ ] — Complete the exact mirrored source/test hierarchy and move cross-module tests to the lowest common composition level.
- [ ] — Remove catch-all CLI, review, and response test files after relocating all tests.
- [ ] — Remove duplicated implementation, unreachable branches, redundant branches, and non-barrel Istanbul ignores.
- [ ] — Run focused tests after each decomposition commit and repair regressions.
- [ ] — Run `npm test` and restore genuine 100×4 coverage across the complete tree.
- [ ] — Run `npm run lint` with zero warnings.
- [ ] — Run `npm run pack` successfully.
- [ ] — Run `git diff --check` successfully.
- [ ] — Run `eliware-test` with zero monolith and source/test mapping violations.
- [ ] — Verify no secrets, runtime state, or generated benchmark output is tracked.
- [ ] — Review the final tree against `module-and-test-architecture.md` and record completion evidence.
