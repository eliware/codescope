# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

Documentation: [docs](docs/README.md) · [specifications](specs/README.md) · [examples](examples/README.md) · [convention manifest](specs/conventions.json)

## @eliware/codescope [![npm](https://img.shields.io/npm/v/@eliware/codescope)](https://www.npmjs.com/package/@eliware/codescope) [![license](https://img.shields.io/npm/l/@eliware/codescope)](https://github.com/eliware/codescope/blob/main/LICENSE) [![CI](https://github.com/eliware/codescope/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/codescope/actions/workflows/nodejs.yml)

A structured OpenAI CLI for focused codebase reviews, suggestions, and token estimates.

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

- Focused review and suggestion profiles for architecture, security, reliability, performance, API design, cross-platform compatibility, dependencies, conventions, and release readiness.
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

The CLI starts with the process environment, then reads only `OPENAI_API_TOKEN` from `~/.codescope`; unrelated dotenv assignments are ignored and a nonblank process value takes precedence. Its dotenv parser accepts optional `export`, comments, and quoted values. On Unix, group/world-readable configuration files are rejected. A missing or blank token causes a clear error and exit code `3`.

## Validation

```text
npm test
git diff --check
```

`codescope all` is the main comprehensive review and suggestion command. It reports P0–P3 findings, but only unresolved P0 or qualifying P1 issues block the verdict.

Running `codescope` with no command displays the single help page. Use `codescope review all` for the comprehensive review, or `codescope suggest all` for all improvement suggestions across the review categories plus `new-features`.

Use `codescope prompt "your question"` for an ad hoc structured-JSON request. It sends the same complete `all` context, without test execution results, and sends no review or suggestion tools. The output is parsed as JSON when possible, but has no Codescope schema: its shape is chosen by the model and is not a stable API contract. Invalid or differently shaped provider output is preserved as raw or best-effort output when possible. Optional `--effort=` and `--model=` overrides are supported. Use `--` before options when the prompt itself begins with a dash, for example `codescope prompt --summarize this repository -- --effort=low`.

`codescope --help` is the single help page. A profile may also be followed by `--help` to display that same page.

Append `--usage` to either grouped (`codescope review all`) or direct (`codescope all`) syntax to include API usage metadata in the final JSON result.

Append `--dry-run` to prepare a request derived from the review context and ask OpenAI for its estimated input-token count without running a model review. The option reports the selected model and estimated input tokens; combine it with `--usage` when you want the count under `usage` as well.

When `--usage` is enabled, the result includes `estimated_cost_usd` calculated from the selected model’s input, cached-input, cache-write, output, and long-context rates. `--dry-run` reports input-token cost only because no output is generated.
Review profiles use package metadata, implementation files, test files, and Markdown files. CodeScope never runs tests in the target repository and never includes test execution results in provider context. Repository owners and separate validation tooling own test execution.
Missing or unknown test exit status is incomplete evidence, not a passing result, and blocks the review until a definitive test result is supplied.
Use `--effort=none|low|medium|high|xhigh|max` to override the default reasoning effort (`none`).
Use `--model=gpt-5.6-luna|gpt-5.6-terra|gpt-5.6-sol` to override the default model.

The effort benchmark runs provider reviews with bounded parallelism. Results and logs are written under `benchmark-results/` in the current working directory. OpenAI and Codescope also support `xhigh` and `max`, but repository benchmark runs were slow and inconclusive, so both are excluded from the benchmark matrix. Use `npm run benchmark:efforts -- --model=gpt-5.6-terra` or `--model=gpt-5.6-sol` to benchmark another supported model; the selected model and repository-configured pricing rates are recorded in `summary.json`.

## Security and operations

Do not place credentials, tokens, `.env` files, or runtime state in the repository. Codescope is read-only: it analyzes files and writes one completed structured result without modifying the reviewed repository.
CodeScope reviews supplied repository files only; it does not execute repository commands or include test execution output. Do not run reviews against workspaces containing credentials or other sensitive values; scrub source, fixtures, and logs first. Redaction is not a guarantee that arbitrary secrets are removed. Custom prompt JSON is provider-defined and has no stable schema, so consumers must validate it themselves.
Use `codescope review all` for release-readiness review.
Maintainer architecture follow-up is tracked in `docs/module-decomposition-plan.md`; its
deferred CLI-entrypoint work is not a claim that the user-facing CLI is incomplete.

## Support

Open an issue in the [GitHub repository](https://github.com/eliware/codescope/issues) or join the [Eliware Discord community](https://discord.gg/M6aTR9eTwN).

## License

Released under the [MIT License](LICENSE).

## Links

- [npm package](https://www.npmjs.com/package/@eliware/codescope)
- [GitHub repository](https://github.com/eliware/codescope)
- [Release notes](RELEASE_NOTES.md)
- [Eliware Discord](https://discord.gg/M6aTR9eTwN)
