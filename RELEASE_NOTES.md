# Release notes

## v2.0.0

Codescope is a native ESM Node.js command-line tool for reviewing repository code and documentation with streamed OpenAI analysis. It collects the relevant repository content, applies a focused review profile, and writes concise findings directly to the terminal.

### Command-line experience

- `codescope` displays the progressive quick-start guide.
- `codescope --help` displays the same complete usage guide.
- `codescope --version` reports the package version.
- Profile names are supplied directly as commands, for example `codescope code` or `codescope release`.
- `--usage` optionally appends the provider token-usage summary to a review.
- Review output is streamed as it arrives and the process exits cleanly after completion.

### Review profiles

- `code`, `code-docs`, `code-tests`, and `code-tests-docs` review implementation with the selected combination of tests and documentation.
- `refactor` identifies monolithic files and mixed responsibilities, then proposes smaller single-purpose file and folder boundaries.
- `architecture` focuses exclusively on architectural structure and optimization opportunities.
- `new-features` suggests useful product or technical capabilities based on the implementation.
- `security`, `performance`, `reliability`, `api-design`, `dependencies`, `observability`, and `accessibility` provide focused specialist reviews.
- `release` produces one verdict: `pass`, `pass with known issues`, or `block release`; blocking is limited to correctness, security, reliability, or user-data findings.
- `quick-wins`, `prioritize`, `p0`, `p0-1`, `p0-2`, and `p0-3` support action-oriented prioritization and priority-range reviews.
- `tests` reviews tests without implementation analysis.
- `tests-docs` reviews tests and documentation together.
- `docs` reviews documentation for inconsistencies.
- `all` reviews implementation, tests, and documentation from every supported review angle in one consolidated report.

### Repository analysis

- Scans the current working directory at invocation time.
- Includes the complete content of selected `.mjs` and `.md` files in the review context.
- Ignores `.git` and `node_modules` directories.
- Skips symbolic files and directories entirely; symbolic links are never followed.
- Test profiles include files ending in `.test.mjs` as test files.
- Produces deterministic, sorted source sections with a relative-path header and one-based line numbers.
- Applies bounded concurrency and source-size limits before sending repository content to the provider.
- Uses profile-specific source selection so code, tests, and documentation are included only when relevant.

### Review guidance

- Shared instructions establish concise, evidence-based findings and priority labels.
- Profile prompts focus the model on the selected review objective.
- Findings identify the affected relative file path and line number when applicable.
- Inline comments can document intentional policies, constraints, or accepted trade-offs. The reviewer honors nearby comments, avoids reporting documented behavior as a false positive, and focuses on issues not already explained by an applicable comment.
- Code-focused profiles request analysis and recommendations only; refactoring is performed by the developer, not by the scanner.
- Documentation-focused profiles look for inconsistencies rather than treating style preferences as implementation defects.
- The combined profile evaluates conflicts between implementation and documentation without becoming a general code-issue report.

### Configuration and provider access

- Uses native Node.js ESM with the Node.js 26 runtime.
- Reads `OPENAI_API_TOKEN` from the process environment or the user-level `~/.codescope` configuration file.
- Keeps provider credentials outside the repository and does not require a repository-local secret file.
- Uses `@eliware/openai` for streamed Responses API requests and `@eliware/common` for shared path and utility behavior.
- Uses built-in prompts for every supported profile.
- Supports cancellation and signal cleanup during active reviews.
- Reports configuration, filesystem, provider, and stream failures with actionable CLI errors.

### Project conventions

- Behavior lives in `src/`, with `bin/codescope.mjs` limited to process wiring.
- Source code uses `.mjs` native ESM modules.
- Automated tests live in `tests/`.
- Standard test, lint, and package-validation commands are provided through npm scripts.
