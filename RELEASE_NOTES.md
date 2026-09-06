# Release notes

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
