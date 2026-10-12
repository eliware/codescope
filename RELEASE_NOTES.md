# Release Notes

## 12.0.0 — 2026-10-12

### Added

- Add grouped `review` and `suggest` commands and focused profiles.
- Add custom prompts with repository context and repeatable prompt additions.
- Add token and cost reports with live requests and dry runs.
- Add model selection and reasoning effort options.
- Add a conventions category for review issues.
- Add repository evidence selection for code, tests, documentation, package data, and file inventory.
- Add API token setup through the process environment or `~/.codescope`.
- Add request and response details, reasoning summary events, and request IDs to debug output.
- Add end-user guides for setup, commands, configuration, operations, and troubleshooting.
- Add optional OpenAI web search to review, suggestion, and custom prompt requests.

### Changed

- Use `@eliware/openai` v12 for Responses API requests, model data, and usage cost calculations.
- Send one provider request for each review, suggestion, and custom prompt.
- Use category-based review results with issue text and source locations.
- Require evidence for each reported issue and keep mixed claims to supported defects.
- Print provider output as text. Print a reasoning summary first when the provider returns one.
- Use `gpt-6-luna` as the default model and `none` as the default reasoning effort.
- Ask review requests for an automatic reasoning summary.
- Allow web search with structured output tools while requiring a structured result.
- Keep review commands read-only. Do not run commands or tests in the reviewed repository.
- Keep issue reports informational. Do not use issue text or verdicts as process exit status.

### Fixed

- Bound repository file reads and reject symbolic links during discovery.
- Improve input checks for paths, token files, options, and provider responses.
- Preserve useful provider error details when a request fails.

### Breaking changes

- Print the provider response instead of a CodeScope-parsed result object.
- Do not depend on a stable machine-readable result format.

### Migration

- Use `codescope suggest new-features`. The direct `codescope new-features` command is not supported.
- Use grouped commands such as `codescope review security` or `codescope suggest architecture`.
