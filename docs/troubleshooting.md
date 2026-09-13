# Troubleshooting

Use this guide when a CodeScope command does not complete as expected.

## Missing token

Configure `OPENAI_API_TOKEN` in the environment or `~/.codescope`, then rerun
the command. Never put the token in a repository file or paste it into review
input.

## Test results are not present

CodeScope never runs repository tests and never includes test execution output
in provider context. Obtain test status from the repository's own validation or
CI workflow.

## Unexpected provider output

CodeScope preserves valid JSON and uses best-effort formatting for malformed
provider output so the result is not lost. Use `--usage` when investigating
token or cost behavior, and rerun only when a fresh assessment is needed.

For support, use the issue tracker linked from the root README.
