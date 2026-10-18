# Setup guide

## Requirements

Use Node.js 26 or later.
Read an OpenAI API token.

## Install

Install CodeScope as a global command.

```text
npm install -g @eliware/codescope
```

CodeScope accepts Windows and Linux paths.
CI runs on Ubuntu Linux.
CI does not test Windows.

## Set the API token

Set `OPENAI_API_TOKEN` in your process environment.
See [Configuration](configuration.md) for the token file option.

PowerShell:

```powershell
$env:OPENAI_API_TOKEN = "your-token"
```

Linux shell:

```sh
export OPENAI_API_TOKEN="your-token"
```

Do not save a actual token in a repository file.

## Run a inspection

Change to the repository that you want to inspect.
Run the `all` profile.

```text
cd path/to/repository
codescope all
```

CodeScope sends the supplied repository content to OpenAI.
It prints the provider response to standard output.
It does not change the reviewed repository or run its tests.

## Select a profile

Use a inspection profile to find issues.
Use a suggestion profile to request improvement ideas.

```text
codescope review security
codescope suggest architecture
codescope suggest new-features
```

Read the [command guide](commands.md) for all profiles and options.
