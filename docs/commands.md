# Commands

Run commands from the repository that you want to review.
Use `codescope --help` to print the quick-start guide.
Use `codescope --version` to print the package version.

## Review profiles

Use review profiles to find issues in supplied repository content.

```text
codescope all
codescope review all
codescope review release
codescope review conventions
codescope review security
codescope architecture
```

The `all` profile reviews code, tests, documentation, package data, and the file inventory.
The `release` profile checks release readiness.
The `conventions` profile checks supplied rules and repository consistency.
Other review profiles focus on one area.

Review profiles are `all`, `release`, `conventions`, `p0`, `p0-1`, `p0-2`, `p0-3`,
`architecture`, `api-design`, `cross-platform`, `refactor`, `security`, `reliability`,
`performance`, `dependencies`, `observability`, `accessibility`, `quick-wins`, and `prioritize`.

You can use a direct profile command for a review.
For example, `codescope security` is the same as `codescope review security`.

## Suggestion profiles

Use suggestion profiles to request non-blocking ideas.

```text
codescope suggest all
codescope suggest architecture
codescope suggest new-features
```

Suggestion profiles are `all`, `new-features`, `architecture`, `api-design`, `cross-platform`,
`refactor`, `security`, `reliability`, `performance`, `dependencies`, `observability`,
`accessibility`, `quick-wins`, and `prioritize`.

The `all` suggestion profile checks review areas and new features.
The `new-features` profile is available only with `suggest`.

## Custom prompts

Use `prompt` to send your own request with repository context.

```text
codescope prompt "List the main reliability risks"
codescope prompt "Review changed files" --add "Focus on error handling"
```

CodeScope puts the repository context before your prompt.
It treats repository content as review data.
It does not add the review or suggestion policy to a custom prompt.

Use `--add` to append more instructions.
Repeat `--add` to append more than one instruction.
Use `-a`, `--add`, `-a=`, or `--add=`.

Put prompt text that starts with a dash before `--`.
Put option values after `--`.
After `--`, use only `--effort`, `--model`, or `--debug-request`.

```text
codescope prompt --summarize this -- --effort=low
```

Custom prompts do not support `--usage` or `--dry-run`.

## Options

Use these options with review and suggestion commands:

- `--model=<name>` selects a model.
- `--effort=<level>` sets reasoning effort.
- `--usage` prints token counts and calculated cost.
- `--dry-run` estimates input tokens and cost without a provider request.
- `--debug-request` prints request and response data to standard error.
- `--add <text>` appends text to the request. You can repeat this option.

Use these reasoning effort levels: `none`, `low`, `medium`, `high`, `xhigh`, or `max`.
The default effort is `none`.
The default model is `gpt-6-luna`.

Supported models are `gpt-6-astra`, `gpt-6-sol`, `gpt-6.1-sol`, `gpt-6-luna`, `gpt-5.6-luna`,
`gpt-5.6-terra`, and `gpt-5.6-sol`.

Review requests ask for an automatic reasoning summary.
CodeScope prints a summary before the provider response when the provider returns one.
It then prints the provider response unchanged.

Use `--usage --dry-run` to report estimated input tokens and cost.
Use `--usage` on a live request to report provider token counts and calculated cost.

Debug output can contain sent repository content and provider data.
Protect that output.

## Exit codes

CodeScope returns `0` after a successful request.
Review issues and verdicts do not change this code.

| Code  | Meaning                                        |
| ----- | ---------------------------------------------- |
| `0`   | The command completed.                         |
| `2`   | The command or option syntax is invalid.       |
| `3`   | The API token or its configuration is invalid. |
| `4`   | CodeScope cannot read or use the input.        |
| `5`   | The provider request failed.                   |
| `6`   | The provider response is invalid.              |
| `124` | The request timed out.                         |
| `130` | The user stopped the command with SIGINT.      |
| `143` | The system stopped the command with SIGTERM.   |
