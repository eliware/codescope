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

CodeScope preserves the selected successful provider response text unchanged.
It does not parse or format that response. Reviews make an initial request and
a follow-up re-review request. If the follow-up fails, CodeScope writes the
initial review response instead. Failures in evidence collection, provider
setup, the initial request, or output handling are reported and emit a safe
incomplete result when possible.
Fallback diagnostics preserve independently readable fields, are JSON-serialized,
redacted, and capped; a `response_truncated` marker identifies capped output.
Tool-call arguments in that summary are diagnostic serialization, not successful
review output. Use `--usage` when investigating token or cost behavior, and rerun
only when a fresh assessment is needed.

For support, use the issue tracker linked from the root README.
