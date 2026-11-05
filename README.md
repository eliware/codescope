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

CodeScope reviews repository content, reports issues, suggests improvements, and estimates token use and cost.
CodeScope does not change a reviewed repository or run its tests.
See the [documentation index](docs/README.md) for user guides.
See [specifications](specs/README.md) for repository rules.

## Requirements

Use Node.js 26 or later.
Create an OpenAI API token.

## Setup

Install CodeScope as a global command.

```text
npm install -g @eliware/codescope
```

The command entrypoint is `bin/codescope.mjs`.
The package export is `src/cli/main.mjs`.
The package files include `src/`, `docs/`, `README.md`, `AGENTS.md`, `LICENSE`, `RELEASE_NOTES.md`, `bin/`, `specs/`, and `prompts/`.

Use numeric `MAJOR.MINOR.PATCH` versions that match the applied convention version.
Follow Eliware Operations for release approval. Passing validation does not authorize publication.

Read the [setup guide](docs/quick-start.md) to install and run CodeScope.

## Usage

Run CodeScope from the repository that you want to inspect.

```text
codescope all
codescope review release
codescope suggest architecture
```

Read [release notes](RELEASE_NOTES.md) for version changes.
Read the [command guide](docs/commands.md) for commands and options.

## Development

Read [AGENTS.md](AGENTS.md) for repository instructions.

## Testing

Run `npm test` for aggregate validation.
CodeScope does not run tests in a reviewed repository.

## Troubleshooting

Read the [troubleshooting guide](docs/troubleshooting.md) for help with common errors.

## Security

CodeScope sends selected repository content to OpenAI.
Remove secrets and private data from that content before you run CodeScope.
Read [Operations and data](docs/operations.md) for request and data details.

## Configuration

Set `OPENAI_API_TOKEN` in the process environment or in `~/.codescope`.
Read the [configuration guide](docs/configuration.md) for token rules and command values.

## Operations

Read [Operations and data](docs/operations.md) for context selection, request behavior, output, and usage.

## Commands

Use `codescope --help` to print the setup guide.
Read the [command guide](docs/commands.md) for command behavior, options, arguments, defaults, and examples.

## Exit codes

Reported issues do not change the command exit code.
Read the [command guide](docs/commands.md#exit-codes) for all exit codes.

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
