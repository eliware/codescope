# Single-responsibility decomposition commit plan

Baseline rollback commit: `68b94de6090cef4efc18bebe83b51129882d8486`

Each line below represents one focused commit. No line contains a separate sub-step; tests and relevant documentation belong in the same commit as the implementation they cover. Completed commits are recorded with their short hash.

- [x] `5b85cb2` — Create mirrored responsibility directories under `src/` and `tests/`.
- [x] `b0276b5` — Move benchmark status behavior and its test into the mirrored benchmark hierarchy.
- [x] `414b17c` — Add the focused benchmark adapter test and retain only the permitted barrel coverage exception.
- [ ] — Establish the complete production-module inventory and commit the matching source/test architecture map.
- [ ] — Decompose the CLI into focused constants, version, errors, options, arguments, help, output, commands, dispatch, and orchestration modules with mirrored tests.
- [ ] — Decompose profile metadata, source selection, prompt routing, categories, tools, and profile construction into focused modules with mirrored tests.
- [ ] — Decompose prompt guidance, schemas, builders, review prompts, suggestion prompts, and priority prompts into focused modules with mirrored tests.
- [ ] — Decompose file discovery into focused root/platform, entry, symlink, exclusion, extension, test-matching, containment, traversal, and orchestration modules with mirrored tests.
- [ ] — Decompose source combination into focused reading, batching, limit, numbering, normalization, header, and orchestration modules with mirrored tests.
- [ ] — Decompose aggregate combination into focused package, configuration, source-group, inclusion, inventory, metadata, binary, truncation, section, and orchestration modules with mirrored tests.
- [ ] — Decompose configuration loading into focused path, dotenv, environment-merge, and security modules with mirrored tests.
- [ ] — Decompose request construction into focused input, tool, reasoning, model, option, and orchestration modules with mirrored tests.
- [ ] — Decompose response handling into focused error, tool-call, argument, exact-key, category, issue, suggestion, review-result, and combined-result modules with mirrored tests.
- [ ] — Decompose the review lifecycle into focused test-execution, output, redaction, environment, configuration, client, signal, dry-run, plain-text, structured-review, usage, failure, and orchestration modules with mirrored tests.
- [ ] — Decompose pricing into focused rate, threshold, calculation, and formatting modules with mirrored tests, or document why the existing module is already single-purpose.
- [ ] — Convert remaining public implementation modules into thin adapters or pure re-export barrels, with adapter tests and no non-barrel Istanbul ignores.
- [ ] — Relocate cross-module tests to the lowest common architecture level and remove the remaining catch-all CLI, review, and response test files.
- [ ] — Remove duplicated, unreachable, and redundant implementation branches and remove every non-barrel Istanbul ignore.
- [ ] — Restore genuine 100×4 coverage across the complete mirrored source/test tree and commit the focused test additions or refactors.
- [ ] — Resolve all lint warnings and commit the clean lint state.
- [ ] — Make the package build successfully with `npm run pack` and commit any required packaging corrections.
- [ ] — Resolve all whitespace errors reported by `git diff --check` and commit the clean diff state.
- [ ] — Make `eliware-test` pass with zero monolith and source/test-mapping violations and commit any required corrections.
- [ ] — Remove or ignore only untracked secrets, runtime state, and generated benchmark output, then commit the clean repository state.
- [ ] — Complete the final architecture audit against `module-and-test-architecture.md`, record the evidence, and commit the completed checklist.
