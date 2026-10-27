# Release Notes

## 15.0.1 — 2026-10-26

### Changed

- Set the CodeScope package version to 15.0.1.
- Update `@eliware/common`, `@eliware/openai`, and `@eliware/test` to 15.0.1.
- Refresh the lockfile with current compatible transitive package versions.

## 15.0.0 — 2026-10-22

### Added

- Add `codescope refactor` for focused module and test refactoring guidance.
- Add `codescope conventions` to report differences from applicable conventions.
- Load runtime prompts from Markdown files in the packaged `prompts/` directory.

### Changed

- Turn web lookup off by default. Add `--web-search` to enable it for a request.
- Run the refactor prompt with repository content and no tools or web lookup.
- Include only applicable semantic conventions in request context. Keep deterministic files
  outside model context.
- Show excluded lockfiles and their metadata in the file inventory. Do not send lockfile content.
- Set refactor suggestions to use subfolders and prevent module names with shared prefixes.
- Move CLI, context, profile, and request modules into focused folders.
- Use Eliware Test v15 rules and canonical CI, npm, and Knit workflows.
- Fetch full Git history in CI.
- Require `@eliware` v15 dependencies. Keep Node.js 26 as the minimum version.
- Expand user guides for setup, commands, configuration, operations, and troubleshooting.
- Remove content from `AGENTS.md` and `README.md` that the applied conventions do not require.

### Fixed

- Align the `conventions` prompt and command guide with supported options.
- Correct Windows path handling for convention files.
- Reject `--dry-run` for help and version commands.

### Breaking changes

- Web lookup is off by default. Add `--web-search` to access current public information.
- Require `@eliware` v15 package dependencies.

## 12.0.0 — 2026-10-12

### Added

- Add grouped `review` and `suggest` commands and focused profiles.
- Add custom prompts with repository context and repeatable prompt additions.
- Add token and cost reports with live requests and dry runs.
- Add model selection and reasoning level options.
- Add a conventions category for inspection issues.
- Add repository support selection for code, tests, documentation, package data, and file inventory.
- Add API token setup through the process environment or `~/.codescope`.
- Add request and response details, reasoning summary events, and request IDs to debug output.
- Add end-user guides for setup, commands, configuration, operations, and troubleshooting.
- Add optional OpenAI web lookup to inspection, suggestion, and custom prompt requests.

### Changed

- Use `@eliware/openai` v12 for Responses API requests, model data, and usage cost calculations.
- Send one provider request for each inspection, suggestion, and custom prompt.
- Use category-based inspection results with issue text and source locations.
- Require support for each reported issue and keep mixed claims to supported defects.
- Print provider output as text. Print a reasoning summary first when the provider returns one.
- Use `gpt-6-luna` as the default model and `none` as the default reasoning level.
- Ask inspection requests for an automatic reasoning summary.
- Allow web lookup with structured output tools while requiring a structured result.
- Keep inspection commands read-only. Do not run commands or tests in the inspected repository.
- Keep issue reports informational. Do not use issue text or verdicts as process exit status.

### Fixed

- Bound repository file reads and reject symbolic links during discovery.
- Check paths, token files, options, and provider responses.
- Preserve useful provider error details when a request fails.

### Breaking changes

- Print the provider response, not a CodeScope-parsed result object.
- Do not depend on a stable machine-readable result format.

### Migration

- Use `codescope suggest new-features`. The direct `codescope new-features` command is not supported.
- Use grouped commands such as `codescope review security` and `codescope suggest architecture`.
