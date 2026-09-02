# Release notes

## v2.2.0

### Structured reviews and release readiness

- Review profiles return one structured `submit_review` result with a verdict and complete issue records.
- Tool calls are required to run sequentially with parallel tool calls disabled.
- Release reviews use the binary `pass` or `block` verdict and evaluate only concrete P0/P1 blockers.
- Tool-result validation rejects malformed issue entries before output.

### Repository analysis and documentation

- Source combination preserves explicit line numbers and skips symlinked entries.
- Documentation describes the completed structured-response workflow and current release verdict contract.
- Prettier formatting is configured for the CLI source and focused tests.

## v2.1.0

### Comprehensive review profile

- `codescope all` reviews implementation, tests, and Markdown in one request.
- The consolidated review covers correctness, security, reliability, performance, architecture, API design, test quality, and documentation consistency.
- Findings are grouped by category, with `None` shown for categories without findings.
- Duplicate underlying findings are consolidated into one best-fit category.

### Review policies

- Global review guidance honors nearby `codescope ignore:` annotations as scoped suppression directives.
- One annotation can describe multiple intentional behaviors.
- Partially covered findings identify only the uncovered residual behavior and provide copyable replacement ignore text when appropriate.
- Release reviews use a binary `pass` or `block` verdict and omit ignored or intentional findings from the report.

### CLI and documentation

- Profile ordering and progressive workflow guidance are documented in the single help page.
- Profile dispatch coverage includes the complete supported profile set.
- Configuration, adapter boundaries, cleanup behavior, and accepted platform limitations are documented for focused review.
- Review profiles emit one structured review and optional `--usage` metadata; no automatic guidance text is appended.
- Reported issues include a copy-paste-ready `// codescope ignore:` example; partially covered issues include a complete replacement annotation when needed.

## v2.0.0

Codescope is a native ESM Node.js command-line tool for reviewing repository code and documentation with structured OpenAI analysis. It collects the relevant repository content, applies a focused review profile, and writes concise findings directly to the terminal.

### Command-line experience

- `codescope` displays the progressive quick-start guide.
- `codescope --help` displays the same complete usage guide.
- `codescope --version` reports the package version.
- Profile names are supplied directly as commands, for example `codescope code` or `codescope release`.
- `--usage` optionally adds provider token-usage metadata to the structured review result.
- Review output is written once after the complete tool response arrives and the process exits cleanly.

### Review profiles

- `code`, `code-docs`, `code-tests`, and `code-tests-docs` review implementation with the selected combination of tests and documentation.
- `refactor` identifies monolithic files and mixed responsibilities, then proposes smaller single-purpose file and folder boundaries.
- `architecture` focuses exclusively on architectural structure and optimization opportunities.
- `new-features` suggests useful product or technical capabilities based on the implementation.
- `security`, `performance`, `reliability`, `api-design`, `dependencies`, `observability`, and `accessibility` provide focused specialist reviews.
- `release` produces one verdict: `pass` or `block`; blocking is limited to concrete correctness, security, reliability, or user-data findings.
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
- Uses `@eliware/openai` for structured Responses API requests and `@eliware/common` for shared path and utility behavior.
- Uses built-in prompts for every supported profile.
- Supports cancellation and signal cleanup during active reviews.
- Reports configuration, filesystem, and provider failures with actionable CLI errors.

### Project conventions

- Behavior lives in `src/`, with `bin/codescope.mjs` limited to process wiring.
- Source code uses `.mjs` native ESM modules.
- Automated tests live in `tests/`.
- Standard test, lint, and package-validation commands are provided through npm scripts.
