# Troubleshooting

Use this guide when a CodeScope command does not complete as expected.

## Missing token

Configure `OPENAI_API_TOKEN` in the environment or `~/.codescope`, then rerun
the command. Never put the token in a repository file or paste it into review
input.

## Test evidence fails or times out

Review profiles that include tests run the target repository's `npm test` with
a bounded timeout. Fix the target repository's test failure, or choose a
longer `--test-timeout` when the test suite is expected to take longer. The
captured output is evidence for the review and is redacted on a best-effort,
pattern-based basis.

## Unexpected provider output

CodeScope preserves valid JSON and uses best-effort formatting for malformed
provider output so the result is not lost. Use `--usage` when investigating
token or cost behavior, and rerun only when a fresh assessment is needed.

For support, use the issue tracker linked from the root README.
