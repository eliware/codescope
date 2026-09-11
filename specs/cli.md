# CLI behavior

## Commands

- `codescope` or `codescope --help` displays the owner workflow and command guidance.
- `codescope all` runs the comprehensive review and suggestion operation.
- `codescope review <profile>` runs an issue-focused review profile.
- `codescope suggest <profile>` runs a suggestion profile.
- A direct profile name is accepted as shorthand where supported.
- `codescope prompt "..."` sends a custom plain-text request using the normal repository context without review or suggestion tools.

Custom prompts reuse the shared request envelope for model, effort, usage, and
context settings, but intentionally disable review and suggestion tools. Their
provider response is returned to the downstream AI consumer without a verdict
requirement.

## Options

- `--usage` includes provider token and calculated cost data.
- `--dry-run` estimates input tokens without running a model review.
- `--effort=none|low|medium|high|xhigh|max` selects reasoning effort.
- `--model=gpt-5.6-luna|gpt-5.6-terra|gpt-5.6-sol` selects the model.
- `--omit-test-results` excludes execution evidence for test-inclusive review profiles.
- `--test-timeout <seconds>` changes the test execution timeout.

## Configuration

The public configuration file is `~/.codescope` and contains
`OPENAI_API_TOKEN`. A nonblank process environment value takes precedence.
Configuration files with unsafe Unix permissions are rejected.

## Output and status

Successful operations print one JSON result. Provider response failures are
reported as errors. Invalid or differently shaped provider JSON is preserved
as raw or best-effort output when possible; provider payload shape is not a
CodeScope acceptance gate. CodeScope still reviews its own request, parsing,
preservation, fallback, error, tool-call, and verdict handling. Review status
is derived only from the provider `verdict`: exact `pass` succeeds and every
other or missing value is blocked. Exit codes
distinguish configuration, request, provider, response, and review-verdict
failures.

If writing a successful or fallback result fails, the operation remains fatal;
programmatic callers may inspect the thrown error's preserved `result` and
`fallbackError` metadata.
