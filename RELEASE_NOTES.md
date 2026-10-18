# Release Notes

## 13.0.0 — 2026-10-17

### Added

- Add optional web lookup to inspect, suggestion, and custom prompt requests.
- Add web lookup data and cost guidance to the user documentation.

### Changed

- Allow web lookup with automatic tool selection and require structured function results.
- Use Eliware Test v13 conventions and canonical npm workflows.

### Fixed

- Repair request handling so inspection and suggestion results keep their required schemas.

## 12.0.0 — 2026-10-12

### Added

- Add grouped `review` and `suggest` commands and focused profiles.
- Add custom prompts with repository context and repeatable prompt additions.
- Add token and cost reports with live requests and dry runs.
- Add model selection and reasoning reasoning level options.
- Add a conventions category for inspection issues.
- Add repository support selection for code, tests, documentation, package data, and file inventory.
- Add API token setup through the process environment or `~/.codescope`.
- Add request and response details, reasoning summary events, and request IDs to debug output.
- Add end-user guides for setup, commands, configuration, operations, and troubleshooting.
- Add optional OpenAI web lookup to inspect, suggestion, and custom prompt requests.

### Changed

- Use `@eliware/openai` v12 for Responses API requests, model data, and usage cost calculations.
- Send one provider request for each inspection, suggestion, and custom prompt.
- Use category-based inspection results with issue text and source locations.
- Require support for each reported issue and keep mixed claims to supported defects.
- Print provider output as text. Print a reasoning summary first when the provider returns one.
- Use `gpt-6-luna` as the default model and `none` as the default reasoning reasoning level.
- Ask inspection requests for an automatic reasoning summary.
- Allow web lookup with structured output tools while requiring a structured result.
- Keep inspection commands read-only. Do not run commands or tests in the reviewed repository.
- Keep issue reports informational. Do not use issue text or verdicts as process exit status.

### Fixed

- Bound repository file reads and reject symbolic links during discovery.
- Make better input checks for paths, token files, options, and provider responses.
- Preserve useful provider error details when a request fails.

### Breaking changes

- Print the provider response rather of a CodeScope-parsed result object.
- Do not depend on a stable machine-readable result format.

### Migration

- Use `codescope suggest new-features`. The direct `codescope new-features` command is not supported.
- Use grouped commands such as `codescope review security` or `codescope suggest architecture`.
