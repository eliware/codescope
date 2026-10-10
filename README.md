# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

@eliware/codescope [![npm](https://img.shields.io/npm/v/@eliware/codescope)](https://www.npmjs.com/package/@eliware/codescope) [![License](https://img.shields.io/github/license/eliware/codescope)](https://github.com/eliware/codescope/blob/main/LICENSE) [![CI](https://github.com/eliware/codescope/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/codescope/actions/workflows/ci.yaml)

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
- [License](#license)
- [Links](#links)

## Features

CodeScope is a read-only CLI for AI-assisted repository reviews, suggestions, and token estimates.
It reviews supplied evidence and does not change the reviewed repository.

The package description is: `A structured OpenAI CLI for focused codebase reviews, suggestions, and token estimates.`
The author is `Eliware <eliware@eliware.org>`. The license is MIT.

- Focused profiles review architecture, security, reliability, performance, API design, dependencies, conventions, and release readiness.
- The `all` profile reviews code, tests, and Markdown in one provider request.
- The CLI estimates tokens and cost. It also selects models and reasoning effort.
- Discovery avoids symbolic links and follows documented evidence limits.
- The CLI does not change the reviewed repository.

See [documentation](docs/README.md) and [specifications](specs/README.md).

## Requirements

- Node.js 26.x
- npm

## Setup

Install the public package globally or in a project. It uses registry dependencies.
It does not require a sibling checkout.

```text
npm install -g @eliware/codescope
npm install @eliware/codescope
```

The package maps the `codescope` command to `bin/codescope.mjs`.
Run a project-local install with `npx codescope --help`.
Run a global install with `codescope`.

For development, install this checkout's dependencies:

```text
npm ci
```

Run the local CLI with these commands:

```text
node bin/codescope.mjs --help
node bin/codescope.mjs --version
```

You can create a global npm link for this checkout with `npm link`.
The link makes checkout changes available without a new install or publish.
Remove it with `npm unlink --global @eliware/codescope`.
Package users must use the install commands above.

## Usage

Run CodeScope from the repository root.
It reviews supplied evidence, gives focused suggestions, or estimates usage.
It does not modify the repository.

```text
codescope all
codescope review release
codescope review architecture
codescope suggest new-features
codescope --help
```

See [Quick start](docs/quick-start.md) for the owner workflow and profile list.
See [documentation](docs/README.md) for user guidance.
See [specifications](specs/README.md) for CodeScope rules.

The executable is `bin/codescope.mjs`.
The package command is `codescope`.
The package export is `src/cli/main.mjs`.
The version is in `package.json`. Release history is in [RELEASE_NOTES.md](RELEASE_NOTES.md).
Publication requires successful Ubuntu validation, an exact `v#.#.#` tag that matches the package version, and clear authorization through the Eliware Operations release handoff. Passing checks and a matching tag do not authorize publication.

## Development

Use Node.js 26 and native ESM.
Keep runtime code in `src/`, the CLI entry point in `bin/`, guides in `docs/`, and directives in `specs/`.

## Testing

Run these commands for full validation:

```text
npm ci
npm test
npm run lint
npm run audit
npm run pack
npm run format:check
```

Use `npm test` as the aggregate validation command.
The `test` script runs `eliware-test`, which performs aggregate validation.

CodeScope does not run commands in a reviewed repository.

## Troubleshooting

See [Troubleshooting](docs/troubleshooting.md) for token and provider errors.

## Security

Keep credentials, tokens, `.env` files, and runtime state out of the repository.
CodeScope reads supplied files and writes its output.
It does not change the reviewed repository.

CodeScope sends supplied repository context to the configured provider.
It does not run repository commands or tests.
Do not review a workspace with credentials or other secrets.
Remove sensitive values from source, fixtures, and logs first.
Redaction cannot guarantee that it removes every secret.

Custom prompt JSON has a provider-defined format.
The format is not stable. Validate it in your own code.
Use `codescope review release` for a release-readiness review.

## Configuration

Startup: Review commands validate configuration before they create the provider client.
Runtime settings and defaults: CodeScope uses `OPENAI_API_TOKEN` and defaults to `gpt-6-luna`.
Set `OPENAI_API_TOKEN` in the process environment or in `~/.codescope`.
Keep the token outside the repository.

A nonblank process token takes priority.
CodeScope reads `~/.codescope` only when the process value is missing or blank.
CodeScope reads only `OPENAI_API_TOKEN` from that file.
It ignores malformed lines for other names.
It rejects malformed token assignments and quoted token values.
The parser accepts optional `export`, comments, and quoted values.

Selected text files under `.github/` and `.knit/` must be regular files, not symbolic links.
CodeScope limits each selected file to 100,000 bytes and 200 lines.
JSON, YAML, and other supplied evidence must fit the review's aggregate character limit.
A missing or blank token causes an error with exit code `3`.

Use command options to set the model or reasoning effort.
Use `--usage` to report provider token counts and calculated cost.
Use `--dry-run` to estimate token use without a provider call.
Run `codescope --help` for the complete option list.

## Operations

Startup: Review, suggestion, and custom-prompt commands validate configuration before provider setup.
Each command makes one provider request.
Shutdown: CodeScope writes the result, stops its controller, and removes signal handlers.
Help and version commands exit before provider setup.
Termination signals use the same cleanup path.

Operational boundaries: CodeScope reads supplied evidence and writes its own output.
It does not change the reviewed repository or run its commands or tests.
It does not publish reviewed code or deploy it.
Separate authorized workflows handle publication and deployment.
These rules define the supported application workflows and their boundaries.
Runtime settings and defaults are defined in Configuration.

## Commands

`codescope all` is the full review profile.
Use `codescope suggest all` for non-blocking suggestions.
Use `codescope prompt "your question"` for a custom request.

Commands print a provided reasoning summary before the provider response.
They write the provider response unchanged after that summary.
Issues and verdict text do not change the CLI exit code.

Profile commands accept repeatable additions:

```text
codescope all --add "Focus on reliability risks in changed code"
codescope review architecture
codescope suggest new-features
codescope prompt "Explain the main reliability risks"
codescope prompt "Explain the risks" --add "Focus on changed files"
codescope --help
codescope --version
```

Use `-a <text>`, `--add <text>`, `-a=<text>`, or `--add=<text>`.
The CLI appends each addition to the final user message in command-line order.
For `codescope prompt`, place additions before an optional `--` delimiter.
After `--`, use only effort, model, or debug options.
If prompt text starts with `-`, use `--`.

Profile commands support model and effort options, usage reports, and dry-run estimates.
The default model is `gpt-6-luna`.
`--usage` reports token counts and calculated cost for each live request.

Supported platforms: Windows and Linux use the same command syntax.
Validation evidence: CI checks Ubuntu only. It does not check Windows.
Contributors run the global `eliware-test` validator.
CI installs the latest npm, then runs `npm ci` and `npm test` on Ubuntu.

Review commands are read-only. They have no destructive actions.

## Exit codes

Successful commands exit with `0`, even when a review reports issues.
Usage errors exit with `2`. Configuration errors exit with `3`.
Input errors exit with `4`. Provider errors exit with `5`.
Invalid provider responses exit with `6`.
Other errors exit with `4`.
Timeouts exit with `124`. SIGINT exits with `130`. SIGTERM exits with `143`.

Issue reviews print their request and response under separate labels.
Suggestions and prompts print one successful response unchanged.

## Support

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

Ask for help in the [Eliware Discord community](https://discord.gg/M6aTR9eTwN).
You can also use [GitHub issues](https://github.com/eliware/codescope/issues) or email eliware@eliware.org.
Include the command, Node.js version, and redacted diagnostics.

## License

[license](LICENSE)

## Links

- [Documentation](docs/README.md)
- [Specifications](specs/README.md)
- [Home Page](https://github.com/eliware/codescope#readme)
- [Eliware](https://eliware.org)
- [GitHub repository](https://github.com/eliware/codescope.git)
- [Eliware Docs](https://github.com/eliware/docs)
- [GitHub organization](https://github.com/eliware)
- [npm package](https://www.npmjs.com/package/@eliware/codescope)
- [Release Notes](RELEASE_NOTES.md)
- [Discord](https://discord.gg/M6aTR9eTwN)
- Documentation: [docs](docs/README.md) · [specifications](specs/README.md)
- [npm Package](https://www.npmjs.com/package/@eliware/codescope)
