# Troubleshooting

Use this guide when a CodeScope command does not complete as expected.

## Missing token

Set `OPENAI_API_TOKEN` in the process environment or in `~/.codescope`.
Run the command again.
Never put the token in a repository file or review input.

## Test results are missing

CodeScope does not run repository tests.
It does not send test output to the provider.
Get test status from the repository's validation or CI workflow.

## Unexpected provider output

Commands print a provided reasoning summary before the successful provider response.
They write the provider response unchanged after that summary.
Each command makes one provider request.
CodeScope reports evidence, setup, provider, and output errors.
It writes a safe incomplete result when possible.

Fallback diagnostics preserve readable fields.
CodeScope serializes, redacts, and limits this diagnostic data.
The `response_truncated` marker shows that CodeScope limited the output.
Tool-call arguments in this summary are diagnostic data, not review output.

Use `--usage` to inspect token counts and cost.
Run a command again only when you need a new assessment.

For support, use the issue tracker linked from the root README.
