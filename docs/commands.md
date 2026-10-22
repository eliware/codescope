# Commands

Run commands from the repository that you want CodeScope to inspect.
CodeScope uses the current directory as the repository root.

## Help and version

Print the setup guide or package version.

```text
codescope --help
codescope --version
codescope all --help
codescope review all --version
```

Profile help prints the setup guide.
Profile version prints the package version.

## Inspection profiles

Use an inspection profile to check repository content and report issues.

```text
codescope all
codescope review all
codescope release
codescope review security
codescope architecture
```

The direct command `codescope security` matches `codescope review security`.

The inspection profiles are `all`, `release`, `conventions`, `refactor`, `p0`, `p0-1`, `p0-2`,
`p0-3`, `architecture`, `api-design`, `cross-platform`, `security`, `reliability`,
`performance`, `dependencies`, `observability`, `accessibility`, `quick-wins`, and `prioritize`.
The `new-features` profile works only with `suggest`.

The `all` profile checks code, tests, documentation, package data, and file inventory.
The `release` profile checks release readiness with the same repository context.
Other profiles can use a smaller set of files.

## Refactor and conventions commands

Run `refactor` for advice about module responsibilities and test structure.
Run `conventions` to list differences from applicable Eliware Test conventions.

```text
codescope refactor
codescope conventions
codescope review refactor
codescope review conventions
```

These commands send plain-text prompts with the `all` repository context.
They support `--effort`, `--model`, `--debug-request`, `--web-search`, and `--add`.
They do not support `--usage` or `--dry-run`.

## Suggestion profiles

Use a suggestion profile to request improvement ideas.

```text
codescope suggest all
codescope suggest architecture
codescope suggest new-features
codescope suggest refactor
```

Suggestion profiles are `all`, `new-features`, `architecture`, `api-design`, `cross-platform`,
`refactor`, `security`, `reliability`, `performance`, `dependencies`, `observability`,
`accessibility`, `quick-wins`, and `prioritize`.
The `all` profile requests suggestions across the supplied repository content.

## Custom prompts

Use `prompt` to send a custom request with the `all` repository context.

```text
codescope prompt "List the main reliability risks"
codescope prompt "Review changed files" --add "Focus on error handling"
```

CodeScope puts repository content before the custom prompt.
It treats repository content as data for the request.
It does not add inspection or suggestion instructions to a custom prompt.

Use `--add` to append instructions to the request.
Repeat `--add` to append more instructions.
Use `-a`, `--add`, `-a=`, or `--add=`.

Put prompt text that starts with a dash before `--`.
Put supported options after `--`.
After `--`, use `--effort`, `--model`, `--debug-request`, or `--web-search`.

```text
codescope prompt --summarize this -- --effort=low
```

Custom prompts do not support `--usage` or `--dry-run`.

## Options

Use these options with supported commands:

- `--model <name>` selects a model in the installed `@eliware/openai` pricing catalog.
- `--effort <level>` sets the reasoning level.
- `--usage` prints provider token counts and calculated cost after a live request.
- `--dry-run` counts input tokens without requesting a model response.
- `--debug-request` prints request and response data to standard error.
- `--web-search` enables OpenAI web lookup for one request. Lookup is off by default.
- `--add <text>` appends text to the request. Repeat this option as needed.

The parser accepts `--effort low` and `--effort=low`.

Use these reasoning levels: `none`, `low`, `medium`, `high`, `xhigh`, or `max`.
The default reasoning level is `none`.
The default model is `gpt-6-luna`.
The current model catalog includes `gpt-6-astra`, `gpt-6-sol`, `gpt-6.1-sol`, `gpt-6-luna`,
`gpt-5.6-luna`, `gpt-5.6-terra`, and `gpt-5.6-sol`.

Inspection requests ask for an automatic reasoning summary.
CodeScope prints a summary before the provider response when the provider returns one.
CodeScope prints the provider response without changing its text.

Use `--usage --dry-run` to report estimated input tokens and cost.
The dry run sends an input-token count request to OpenAI.
It does not request a model response.
Use `--usage` on a live request to report provider token counts and calculated cost.

```text
codescope all --usage --dry-run
codescope all --effort low --usage
codescope all --debug-request 2> request.log
codescope all --web-search
```

Debug output can contain repository content and provider data.
Limit access to debug output.

## Exit codes

CodeScope returns `0` when a request completes.
Reported issues and verdicts do not change this code.

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
