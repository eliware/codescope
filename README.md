# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/codescope [![npm version](https://img.shields.io/npm/v/@eliware/codescope.svg)](https://www.npmjs.com/package/@eliware/codescope) [![license](https://img.shields.io/github/license/eliware/codescope.svg)](LICENSE) [![CI](https://github.com/eliware/codescope/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/codescope/actions)

Documentation: [docs](docs/README.md) · [specifications](specs/README.md) · [examples](examples/README.md)

CodeScope is a structured OpenAI CLI for read-only reviews of supplied
repository evidence, focused suggestions, and token estimates. It leaves the
reviewed repository unchanged.

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

Package metadata: description `A structured OpenAI CLI for focused codebase reviews, suggestions, and token estimates.`; author `Eliware <eliware@eliware.org>`; license `MIT`.

- Focused review and suggestion profiles for architecture, security, reliability, performance, API design, cross-platform compatibility, dependencies, conventions, and release readiness.
- Comprehensive `all` reviews that combine implementation, tests, and Markdown into one provider review request.
- Token and cost estimates, model selection, and reasoning-effort controls.
- Symlink-safe discovery and documented boundaries for intentional behavior.
- Read-only analysis that does not modify the reviewed repository.

## Requirements

- Node.js 26.x
- npm

## Setup

For package consumers, install the published CLI globally or add it to a project. The published package uses registry dependencies and does not require a sibling checkout:

```text
npm install -g @eliware/codescope
npm install @eliware/codescope
```

The `codescope` executable maps to `bin/codescope.mjs`; the package root
export is `src/cli/main.mjs`. The package version is maintained in
`package.json`; release history is in [RELEASE_NOTES.md](RELEASE_NOTES.md).
Publication requires successful Ubuntu validation and an exact `v#.#.#` tag
matching the package version.

For repository development, install the checkout's dependencies first:

```text
npm ci
```

Run the CLI locally from this checkout:

```text
node bin/codescope.mjs --help
node bin/codescope.mjs --version
```

For this optional development-only setup, create a live global npm link from the already-installed checkout with `npm link`. The resulting `codescope` command points directly at the checkout, so changes are available immediately without reinstalling or republishing. Remove it with `npm unlink --global @eliware/codescope` when no longer needed; package consumers should use the published-install commands above.

## Usage

Run CodeScope from the repository root to review supplied evidence, request
focused suggestions, or estimate review usage without modifying the repository.

```text
codescope all
codescope review architecture
codescope suggest new-features
codescope --help
```

See [docs/quick-start.md](docs/quick-start.md) for the complete owner workflow and profile list.
See [specs/](specs/) for the detailed behavior specifications.
See [NEW_FEATURE_SUGGESTIONS.md](NEW_FEATURE_SUGGESTIONS.md) for optional future ideas.

## Development

CodeScope uses Node.js 26 native ESM. Keep runtime implementation in `src/`,
the CLI entrypoint in `bin/`, end-user guidance in `docs/`, and CodeScope
directives in `specs/`.

## Testing

Use the global `eliware-test` validator for installation, tests, lint, audit,
pack, and formatting checks. CodeScope itself never runs commands in a
reviewed repository.

## Troubleshooting

If convention evidence is unavailable, verify that the adjacent
`eliware/conventions` checkout exists and that `package.json.eliware.apply`
names valid directive files under its `specs/` directory.

## Security

Do not place credentials, tokens, `.env` files, or runtime state in the repository. CodeScope is read-only: it analyzes supplied files and writes its output without modifying the reviewed repository.
CodeScope reviews supplied repository files only; it does not execute repository commands or include test execution output. Do not run reviews against workspaces containing credentials or other sensitive values; scrub source, fixtures, and logs first. Redaction is not a guarantee that arbitrary secrets are removed. Custom prompt JSON is provider-defined and has no stable schema, so consumers must validate it themselves.
Use `codescope review all` for release-readiness review.

## Configuration

The CLI starts with the process environment, then reads only
`OPENAI_API_TOKEN` from `~/.codescope`; unrelated dotenv assignments are
ignored. A nonblank process token takes precedence over the file. A missing or
whitespace-only process token is treated as absent, so a nonblank file token
may be used. The dotenv parser accepts optional `export`, comments, and quoted
values. A missing or blank token causes a clear error and exit code `3`.

Configuration evidence is root-bound, symlink-checked, and bounded to 100000
bytes and 200 lines per configuration file. JSON evidence is root-bound and
subject to the review aggregate character budget.

## Operations

CodeScope is read-only against reviewed repositories. It does not deploy or
publish reviewed code; publication and deployment are handled by separate
release workflows.

## Commands

`codescope all` is shorthand for `codescope review all`. Use
`codescope suggest all` for a non-blocking suggestion pass or
`codescope prompt "your question"` for an ad hoc request. The provider response
to a prompt is written unchanged; provider findings and verdict text never
change the CLI exit code.

Add one or more `-a <text>` or `--add <text>` options to profile commands to
append custom guidance to the final user message. Bare `codescope`, help, and
version output do not apply additions. Use `codescope --help` for the complete
command and option reference, including supported review/suggestion profiles,
model and effort options, usage reporting, and dry-run estimates. CodeScope
defaults to `gpt-6-luna`.

```text
codescope all --add "Focus on reliability risks in recently changed code"
codescope --help
codescope --version
```

CI validates the CLI on Ubuntu. Windows uses the same Node.js command syntax,
but is not currently covered by the supplied CI workflow.
See [examples/README.md](examples/README.md) for additional end-user command
examples.

## Exit codes

Successful commands exit with `0`. Usage errors exit with `2`, configuration
errors with `3`, input errors with `4`, provider/API errors with `5`, and
CodeScope response errors exit with `6`; this status is not derived from review
content. Timeout and termination exits are `124`, `130` (SIGINT), and `143`
(SIGTERM). A successful provider response is written unchanged, and its
findings or verdict text do not affect process exit status.

## Support

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

Use the [Eliware Discord community](https://discord.gg/M6aTR9eTwN),
[GitHub issues](https://github.com/eliware/codescope/issues), or
eliware@eliware.org. Include the command, Node.js version, and redacted
diagnostics when requesting help.

## License

[license](LICENSE)

## Links

- [Documentation](docs/README.md)
- [Specifications](specs/README.md)
- [Home Page](https://eliware.org)
- [GitHub Repo](https://github.com/eliware/codescope)
- [GitHub Org](https://github.com/eliware)
- [npm Package](https://www.npmjs.com/package/@eliware/codescope)
- [Release Notes](RELEASE_NOTES.md)
- [Discord](https://discord.gg/M6aTR9eTwN)
