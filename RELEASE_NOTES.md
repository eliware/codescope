# Release notes

## 8.0.0

- Clarified one-shot review prompts so finding prose remains concise without
  reducing exhaustive issue enumeration; if 100 issues are supported, all 100
  must be reported.
- Updated package metadata and release versioning for Convention v8.
- Replaced legacy v6 convention-review requirements with supplied, structured
  Convention v8 records and declared repository applicability.
- Added JSON review context for repository-root, `docs/`, `examples/`, and
  `specs/` JSON files while excluding `package-lock.json` and unrelated JSON.
- Wired JSON evidence into comprehensive and selected review contexts and added
  focused coverage for the new file-selection behavior.
- Clarified one-shot evidence boundaries: CodeScope reviews supplied material
  but does not run commands or infer unsupplied CI, release, or registry state.
- Updated the development test dependency to `@eliware/test` 4.0.0 and
  restored 100×4 validation with the compatible project test configuration.

## 6.2.0

- Updated project metadata and convention-review guidance for Convention v6.2.
- Added deterministic formatter validation to CI through `format:check`.
- Clarified that `@eliware/test` owns deterministic validation, CodeScope owns
  semantic review, and TagIt owns release orchestration and publication state.

## 6.0.0

- Updated the project release metadata for the next major release.
- Updated the development test tool to `@eliware/test` 6.

## 2.2.0

- Added convention-focused review coverage for repository documentation,
  package metadata, examples, specifications, environment documentation, and
  cross-artifact consistency.
- Added structured review and suggestion tooling with configurable models,
  reasoning effort, usage estimates, and test-result evidence.
- Added Markdown-backed prompt policy modules and focused review profiles while
  preserving deterministic validation responsibilities for `@eliware/test`
  and TagIt.
