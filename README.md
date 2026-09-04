# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/codescope [![npm](https://img.shields.io/npm/v/@eliware/codescope)](https://www.npmjs.com/package/@eliware/codescope) [![license](https://img.shields.io/npm/l/@eliware/codescope)](https://github.com/eliware/codescope/blob/main/LICENSE) [![CI](https://github.com/eliware/codescope/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/codescope/actions/workflows/nodejs.yml)

`codescope` is a Node.js command-line tool for OpenAI-powered codebase reviews, suggestions, and token estimates.

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Validation](#validation)
- [Security and Operations](#security-and-operations)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Features

- Focused review and suggestion profiles for architecture, security, reliability, performance, API design, cross-platform compatibility, dependencies, and release readiness.
- Comprehensive `all` reviews that combine implementation, tests, and Markdown into one structured JSON result.
- Token and cost estimates, model selection, reasoning-effort controls, and configurable test timeouts.
- Symlink-safe discovery and documented boundaries for intentional behavior.
- Read-only analysis that does not modify the reviewed repository.

## Requirements

- Node.js 26 or newer
- npm

## Installation

For package consumers, install the published CLI globally or add it to a project:

```text
npm install -g @eliware/codescope
npm install @eliware/codescope
```

For repository development, install the checkout's dependencies first:

```text
npm ci
```

Run the CLI locally from this checkout:

```text
node bin/codescope.mjs --help
node bin/codescope.mjs --version
```

For this development setup, create a live global npm link from the checkout with `npm link`. The resulting `codescope` command points directly at the checkout, so changes are available immediately without reinstalling or republishing. Remove it with `npm unlink --global @eliware/codescope` when no longer needed.

## Usage

```text
codescope all
codescope review architecture
codescope suggest new-features
codescope --help
```

See [docs/quick-start.md](docs/quick-start.md) for the complete owner workflow and profile list.
See [specs/](specs/) for the detailed behavior specifications.
See [NEW_FEATURE_SUGGESTIONS.md](NEW_FEATURE_SUGGESTIONS.md) for optional future ideas.

## Configuration

The CLI stores only `OPENAI_API_TOKEN` from `~/.codescope`. Its dotenv parser accepts assignment syntax, including optional `export`, comments, and quoted values; every assignment other than `OPENAI_API_TOKEN` is ignored, including duplicate non-token assignments. An existing nonblank process environment variable takes precedence. On Unix, group/world-readable configuration files are rejected. A missing or blank token causes a clear error and exit code `3`.

## Validation

```text
npm test
npm run lint
npm run pack
```

`codescope all` is the main comprehensive review and suggestion command. It reports P0–P3 findings, but only unresolved P0 or qualifying P1 issues block the verdict.

Running `codescope` with no command displays the single help page. Use `codescope review all` for the comprehensive review, or `codescope suggest all` for all improvement suggestions.

Use `codescope prompt "your question"` for an ad hoc plain-text request. It sends the same complete `all` context, including test results, but sends no review or suggestion tools and prints the model's final text response directly. Optional `--effort=` and `--model=` overrides are supported. Use `--` before options when the prompt itself begins with a dash, for example `codescope prompt --summarize this repository -- --effort=low`.

`codescope --help` is the single help page. A profile may also be followed by `--help` to display that same page.

Append `--usage` to either grouped (`codescope review all`) or direct (`codescope all`) syntax to include API usage metadata in the final JSON result.

Append `--dry-run` to prepare the same review request and ask OpenAI for its estimated input-token count without running a model review. The option reports the selected model and estimated input tokens; combine it with `--usage` when you want the count under `usage` as well.

When `--usage` is enabled, the result includes `estimated_cost_usd` calculated from the selected model’s input, cached-input, cache-write, output, and long-context rates. `--dry-run` reports input-token cost only because no output is generated.
Review profiles that include tests use package metadata, implementation files, test files, test results, and Markdown files. They run `npm test` in the target repository with a 30-second timeout by default. Use `--omit-test-results` to skip that command or `--test-timeout 120` to override the timeout. Suggestion profiles do not run tests.
Use `--effort=none|low|medium|high|xhigh|max` to override the default reasoning effort (`none`).
Use `--model=gpt-5.6-luna|gpt-5.6-terra|gpt-5.6-sol` to override the default model.

The effort benchmark runs `none`, `low`, `medium`, and `high` in parallel. OpenAI and Codescope also support `xhigh` and `max`, but repository benchmark runs were slow and inconclusive, so both are excluded from the benchmark matrix. Use `npm run benchmark:efforts -- --model=gpt-5.6-terra` or `--model=gpt-5.6-sol` to benchmark another supported model; the selected model and its current rates are recorded in `summary.json`.

## Security and operations

Do not place credentials, tokens, `.env` files, or runtime state in the repository. Codescope is read-only: it analyzes files and writes one completed structured result without modifying the reviewed repository.
Use `codescope review all` for release-readiness review.

## Support

Open an issue in the [GitHub repository](https://github.com/eliware/codescope/issues) or join the [Eliware Discord community](https://discord.gg/M6aTR9eTwN).

## License

Released under the [MIT License](LICENSE).

## Links

- [npm package](https://www.npmjs.com/package/@eliware/codescope)
- [GitHub repository](https://github.com/eliware/codescope)
- [Release notes](RELEASE_NOTES.md)
- [Eliware Discord](https://discord.gg/M6aTR9eTwN)
