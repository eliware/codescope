# Release notes

## v2.2.0

### Structured reviews and profile workflows

- Review profiles return validated structured `submit_review` and `submit_suggestions` results.
- The comprehensive `all` profile requests exactly one review and one suggestion tool call in parallel and merges both results into one JSON document.
- Review and suggestion schemas adapt to the selected profile categories, require nonempty category arrays, and include explicit no-issue/no-suggestion placeholders.
- Comprehensive reviews use the binary `pass` or `block` verdict; only unresolved P0 or qualifying P1 issues block under the documented evidence and release-scope criteria.
- Tool-result validation rejects malformed payloads, duplicate calls, unsupported fields, and invalid category shapes before output.
- Nearby `codescope ignore:` annotations are supplied as scoped guidance, while uncovered behavior remains reportable.

### CLI and configuration

- Added grouped `review` and `suggest` command forms alongside direct profile aliases.
- Added reasoning-effort overrides for `none`, `low`, `medium`, `high`, `xhigh`, and `max`.
- Added model overrides for GPT-5.6 Luna, Terra, and Sol.
- Added documented exit codes for pass, blocked findings, usage, configuration, input, API, response, timeout, and signal failures.
- Added `--usage` output with provider token details and calculated estimated USD cost.
- Added `--dry-run` input-token estimation through OpenAI’s input-token endpoint without executing a review.
- Configuration now uses `~/.codescope`, validates permissions on Unix, and keeps credentials outside the repository.

### Repository analysis and tooling

- Source discovery scans the working directory recursively while excluding `.git`, `node_modules`, and symbolic links.
- Implementation, test, and Markdown profiles select files internally and preserve relative paths with one-based line numbers.
- Test-inclusive profiles can run `npm test` with a bounded timeout and include sanitized results in the review context.
- Added an effort benchmark runner with parallel effort execution, per-run logs, incremental summaries, model overrides, and pricing calculations.
- Added a shared pricing module covering input, cached input, cache writes, and long-context requests above 272K input tokens.
- Added Prettier configuration and formatting scripts.

### Quality and portability

- Expanded focused tests across CLI parsing, profile dispatch, source discovery, combination, request construction, response validation, pricing, configuration, and review execution.
- Restored 100×4 coverage and zero-warning lint validation.
- Fixed Linux test isolation so permission-path tests do not depend on a developer machine’s `~/.codescope` configuration.
- Updated README and quick-start documentation for the complete profile, structured-output, usage, model, effort, and benchmark workflows.

## v2.1.0

### Comprehensive review profile

- `codescope all` reviews implementation, tests, and Markdown in one request.
- The consolidated review covers correctness, security, reliability, performance, architecture, API design, test quality, and documentation consistency.
- Findings are grouped by category, with a `No issues found.` placeholder for categories without findings.
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
- Profile names are supplied directly as commands, for example `codescope review all` or `codescope suggest new-features`.
- `--usage` optionally adds provider token-usage metadata to the structured review result.
- Review output is written once after the complete tool response arrives; invalid provider responses produce a diagnostic fallback without echoing the provider payload and a nonzero exit code. Only the AI-provided validated `pass` or `block` verdict controls the review result.

### Review profiles

- Review profiles inspect implementation, tests, and documentation together; focused profiles constrain the review question.
- `refactor` identifies monolithic files and mixed responsibilities, then proposes smaller single-purpose file and folder boundaries.
- `architecture` focuses exclusively on architectural structure and optimization opportunities.
- `new-features` suggests useful product or technical capabilities based on the implementation; it is suggestion-only in both direct and grouped syntax.
- `security`, `performance`, `reliability`, `api-design`, `dependencies`, `observability`, and `accessibility` provide focused specialist reviews.
- `all` produces one structured verdict: `pass` or `block`; only unresolved P0 or qualifying P1 findings block under the documented evidence and release-scope criteria.
- `quick-wins`, `prioritize`, `p0`, `p0-1`, `p0-2`, and `p0-3` support action-oriented prioritization and priority-range reviews.
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
- Cleans up local signal handlers when active reviews finish or are interrupted.
- Reports configuration, filesystem, and provider failures with actionable CLI errors.

### Project conventions

- Behavior lives in `src/`, with `bin/codescope.mjs` limited to process wiring.
- Source code uses `.mjs` native ESM modules.
- Automated tests live in `tests/`.
- Standard test, lint, and package-validation commands are provided through npm scripts.
