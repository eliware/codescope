# Setup guide

## Requirements

Install Node.js 26 or a newer version.
Create an OpenAI API token.

## Install

Install CodeScope as a global command.

```text
npm install -g @eliware/codescope
```

Check the installed version.

```text
codescope --version
```

CodeScope accepts Windows and Linux paths.
CI runs on Ubuntu Linux. CI does not test Windows.

## Set the API token

Set `OPENAI_API_TOKEN` in the process environment.

PowerShell:

```powershell
$env:OPENAI_API_TOKEN = "your-token"
```

Linux shell:

```sh
export OPENAI_API_TOKEN="your-token"
```

CodeScope uses a nonblank process value first.
If that value is blank or missing, CodeScope reads `~/.codescope`.
On Windows, this path is `%USERPROFILE%\.codescope`.

The token file must contain this line:

```text
OPENAI_API_TOKEN=your-token
```

Keep the token outside the repository.
Read the [configuration guide](configuration.md) for token file rules.

## Run CodeScope

Run CodeScope from the repository root.
CodeScope uses the current directory as its root.

```text
cd path/to/repository
codescope all
```

CodeScope sends selected repository content to OpenAI.
It prints the provider response to standard output.
It does not change repository files or run repository tests.

## Select a task

Use an inspection profile to check for issues.
Use a suggestion profile to get improvement ideas.
Use `refactor` to get refactoring advice.
Use `conventions` to find differences from applicable Eliware Test conventions.
Use `prompt` to send a custom request.

```text
codescope review security
codescope suggest architecture
codescope refactor
codescope conventions
codescope prompt "List the main reliability risks"
```

Read the [command guide](commands.md) for profiles and options.
