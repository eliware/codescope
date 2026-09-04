# New feature suggestions

These are optional ideas for future consideration. They are not release
requirements, known defects, or commitments.

## CLI and workflow

- Add a `codescope inspect` command that prints the exact files and byte/line
  counts selected for a profile without contacting OpenAI.
- Add a `--output <path>` option for saving the structured result directly to a
  file while retaining the normal terminal summary.
- Add a `--format json|markdown` presentation option for consumers that want a
  human-readable report without changing the validated provider result.
- Add a `codescope profiles` command that prints the available profiles and
  their source selection and purpose.
- Add a local configuration file for repository-specific defaults such as the
  model, effort, test timeout, and default profile.

## Review management

- Add stable finding identifiers so owners can track the same finding across
  review iterations without relying on generated wording.
- Add an optional baseline file that records accepted findings and reports only
  new or changed findings in later runs.
- Add deterministic result sorting by category, severity, path, and line so
  saved reports are easier to diff.
- Add a compact summary mode that reports counts and verdict while preserving a
  path to the complete JSON result.

## Validation and integrations

- Add an opt-in live-provider compatibility check that runs one small request
  against each configured model and effort level.
- Add a provider request transcript mode that records request metadata without
  storing source contents or credentials.
- Add a configurable test command for repositories whose validation entrypoint
  is not `npm test`.
- Add a documented plugin interface for repository-specific context providers
  that can contribute evidence without changing the core scanner.

## Documentation and maintenance

- Generate the CLI profile table and owner workflow from one source so help and
  Markdown documentation cannot drift.
- Include Markdown files in the formatting check after deciding and documenting
  the repository's preferred Markdown formatter settings.
- Add a built-in report explaining which input files were excluded and why,
  while keeping excluded file contents out of the provider request.
