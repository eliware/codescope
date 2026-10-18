# Commands

Run commands from the repository that you want to inspect.
Use `codescope --help` to print the quick-start guide.
Use `codescope --version` to print the package version.

## Inspection profiles

Use inspection profiles to find issues in supplied repository content.

```text
codescope all
codescope review all
codescope review release
codescope review conventions
codescope review security
codescope architecture
```

The `all` profile inspects code, tests, documentation, package data, and the file inventory.
The `release` profile checks release readiness.
The `conventions` profile checks supplied rules and repository consistency.
Other inspection profiles focus on one area.

Available inspection profiles are `all`, `release`, `conventions`, `p0`, `p0-1`, `p0-2`, `p0-3`,
`architecture`, `api-design`, `cross-platform`, `refactor`, `security`, `reliability`,
`performance`, `dependencies`, `observability`, `accessibility`, `quick-wins`, and `prioritize`.

You can use a direct profile command to inspect one area.
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

The `all` suggestion profile checks inspection areas and new features.
The `new-features` profile is available only with `suggest`.

## Custom prompts

Use `prompt` to send your own request with repository context.

```text
codescope prompt "List the main reliability risks"
codescope prompt "Review changed files" --add "Focus on error handling"
```

CodeScope puts the repository context before your prompt.
It treats repository content as inspection data.
It does not add the inspection or suggestion policy to a custom prompt.

Use `--add` to append more instructions.
Repeat `--add` to append more than one instruction.
Use `-a`, `--add`, `-a=`, or `--add=`.

Put prompt text that starts with a dash before `--`.
Put option values after `--`.
After `--`, use `--effort`, `--model`, `--debug-request`, or `--web-search`.

```text
codescope prompt --summarize this -- --effort=low
```

Custom prompts do not support `--usage` or `--dry-run`.

## Options

Use these options with commands that support them:

- `--model=<name>` selects a model.
- `--effort=<level>` sets the reasoning level.
- `--usage` prints token counts and calculated cost.
- `--dry-run` estimates input tokens and cost without a provider request.
- `--debug-request` prints request and response data to standard error.
- `--web-search` enables OpenAI web lookup for this request. Web lookup is off by default.
- `--add <text>` appends text to the request. You can repeat this option.

Use these reasoning levels: `none`, `low`, `medium`, `high`, `xhigh`, or `max`.
The default reasoning level is `none`.
The default model is `gpt-6-luna`.

Supported models are `gpt-6-astra`, `gpt-6-sol`, `gpt-6.1-sol`, `gpt-6-luna`, `gpt-5.6-luna`,
`gpt-5.6-terra`, and `gpt-5.6-sol`.

Inspection requests ask for an automatic reasoning summary.
CodeScope prints a summary before the provider response when the provider returns one.
It then prints the provider response unchanged.

Use `--usage --dry-run` to report estimated input tokens and cost.
Use `--usage` on a live request to report provider token counts and calculated cost.

Debug output can contain sent repository content and provider data.
Prevent access to that output.

## Exit codes

CodeScope returns `0` after a correct request.
Issues and verdicts do not change this code.

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
