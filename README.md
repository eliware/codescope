# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/codescope [![npm](https://img.shields.io/npm/v/@eliware/codescope)](https://www.npmjs.com/package/@eliware/codescope) [![License](https://img.shields.io/github/license/eliware/codescope)](https://github.com/eliware/codescope/blob/main/LICENSE) [![CI](https://github.com/eliware/codescope/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/codescope/actions/workflows/ci.yaml)

A structured OpenAI CLI for focused codebase reviews, suggestions, and token estimates.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Configuration](#configuration)
- [Operations](#operations)
- [Commands](#commands)
- [Exit codes](#exit-codes)
- [Support](#support)
- [Links](#links)
- [License](#license)

## Features

CodeScope reviews supplied repository content and reports issues or suggestions.
It estimates token use and cost.
It does not change the reviewed repository or run its tests.

See the [documentation](docs/README.md) for user instructions.
See the [specifications](specs/README.md) for software rules.

## Requirements

Use Node.js 26 or later.

## Setup

Install the public package with npm.

```text
npm install -g @eliware/codescope
```

The package command is `codescope`.
The CLI entry point is `bin/codescope.mjs`.
The package export is `src/cli/main.mjs`.
Package files include `src/`, `bin/`, `docs/`, `specs/`, `prompts/`, `README.md`, `AGENTS.md`, `LICENSE`, and `RELEASE_NOTES.md`.
See [Setup guide](docs/quick-start.md) for setup steps.

## Usage

Run CodeScope from the repository that you want to inspect.

```text
codescope all
codescope review release
codescope suggest architecture
```

See [Release notes](RELEASE_NOTES.md) for changes by version.
See [Setup guide](docs/quick-start.md) for profile guidance.
Run `codescope --version` to print the installed version.

## Development

Use Node.js 26 or later and native ESM.
Keep runtime code in `src/` and the CLI entry point in `bin/`.
Use native ESM for maintained JavaScript modules.

## Testing

Run `npm test` for aggregate validation.
The command runs `eliware-test`.
CodeScope does not run tests in a reviewed repository.

## Troubleshooting

See the [troubleshooting guide](docs/troubleshooting.md) for common errors.

## Security

CodeScope sends supplied repository content to the configured OpenAI system.
The model can use OpenAI web lookup only when you add `--web-search` to a command.
Web lookup is off by default.
Remove secrets from that content before you run a inspection.
Prevent debug logs because they can contain repository content.
Read [Operations and data](docs/operations.md) for web lookup and cost details.

## Configuration

Set `OPENAI_API_TOKEN` in the process environment or in `~/.codescope`.
See the [configuration guide](docs/configuration.md) for token rules and options.

## Operations

CodeScope reads repository content and writes its result to standard output.
It does not edit the reviewed repository, run its commands, or run its tests.
Each inspection, suggestion, or custom prompt sends one provider request.
Help and version commands send no provider request.
Inspection, suggestion, and prompt commands check configuration before provider setup.
CodeScope stops its request controller and removes signal handlers after each request.

Read [Operations and data](docs/operations.md) for request and output details.
Passing checks does not authorize publication.
Use Eliware Operations for release approval.

## Commands

Use `codescope --help` to view the command list.
Use `codescope prompt "your question"` to send a custom request.
Read the [command guide](docs/commands.md) for options and examples.

## Exit codes

CodeScope returns `0` after a correct request, also when the result lists issues.
It returns a nonzero code when setup, input, provider, or output fails.
Read the [command guide](docs/commands.md#exit-codes) for each code.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## Links

- [Home Page](https://eliware.org)
- [GitHub Org](https://github.com/eliware)
- [GitHub Repo](https://github.com/eliware/codescope)
- [Bug Reports](https://github.com/eliware/codescope/issues)
- [npm](https://www.npmjs.com/package/@eliware/codescope)
- [Discord](https://discord.gg/M6aTR9eTwN)

## License

[MIT © Eliware](LICENSE)
