# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

Documentation: [docs](docs/README.md) · [specifications](specs/README.md) · [convention manifest](specs/conventions.json)

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
- Token and cost estimates, model selection, and reasoning-effort controls.
- Symlink-safe discovery and documented boundaries for intentional behavior.
- Read-only analysis that does not modify the reviewed repository.

## Requirements

- Node.js 26 or newer
- npm

## Installation

For package consumers, install the published CLI globally or add it to a project. The published package uses registry dependencies and does not require a sibling checkout:

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

The CLI starts with the process environment, then reads only `OPENAI_API_TOKEN` from `~/.codescope`; unrelated dotenv assignments are ignored. A nonblank process token takes precedence over the file. A missing or whitespace-only process token is treated as absent, so a nonblank file token may be used. Its dotenv parser accepts optional `export`, comments, and quoted values. Configuration files, including explicitly configured paths, must not be symbolic links. A missing or blank token causes a clear error and exit code `3`.

## Validation

```text
npm test
git diff --check
```

`codescope all` is the main comprehensive review and suggestion command. It requests a provider-defined review result containing P0–P3 findings; unresolved P0/P1 findings should produce an AI `block` verdict in that unchanged provider response. `block` is provider output only: CodeScope does not guarantee or parse a response schema, and provider findings never change the CLI exit code.

Running `codescope` with no command displays the single help page. Use `codescope review all` for the comprehensive review, or `codescope suggest all` for one non-blocking suggestion pass over every review category plus `new-features`; it uses the generic suggestion tool and never interprets findings as review status.

Use `codescope prompt "your question"` for an ad hoc request. It sends the same complete `all` context, without test execution results, and sends no review or suggestion tools. The provider response is written unchanged and has no CodeScope schema. Optional `--effort=` and `--model=` overrides are supported; `--usage` and `--dry-run` are rejected for prompts. Use `--` to terminate prompt text before supported trailing options when the prompt itself begins with a dash; only `--effort=<value>` and `--model=<value>` may follow the delimiter, for example `codescope prompt --summarize this repository -- --effort=low`.

Append one or more `-a <text>` or `--add <text>` options to any profile command, including `all`, `release`, review profiles, suggestion profiles, and `prompt`. Each added string is untrusted provider prompt text, preserved verbatim and appended to the end of the final user message in command-line order. For example: `codescope all --add "Ignore the known local link" --add "Ignore the temporary test version"`. Bare `codescope`, `codescope help`, `codescope --help`, and version output accept additions in normalized command metadata but intentionally do not apply them.

`codescope --help` is the single help page. A profile may also be followed by `--help` to display that same page.

Append `--usage` with `--dry-run` to either grouped (`codescope review all`) or direct (`codescope all`) review syntax to include usage metadata. `--dry-run` is supported on review and suggestion profile commands and returns that metadata as CodeScope output; it is not valid for `codescope prompt`, whose successful provider response text remains unchanged.

Append `--dry-run` to prepare a request derived from the review context and ask OpenAI for its estimated input-token count without running a model review. Dry-run still requires the configured token and provider client because the count is obtained from OpenAI. The option reports the selected model and estimated input tokens; combine it with `--usage` when you want the count under `usage` as well.

With `--dry-run --usage`, the result includes `estimated_cost_usd` calculated from the selected model’s input, cached-input, cache-write, output, and long-context rates. Dry-run reports input-token cost only because no output is generated. Internal output writers return `{ written }` with an exact JavaScript character count; missing results, booleans, false, short counts, and unrelated values fail. Counts are JavaScript characters, not UTF-8 bytes. Successful provider response text is written unchanged. Fallback diagnostics preserve independently readable safe fields, are JSON-serialized, redacted, capped, and marked with `response_truncated` when capped. Provider setup failures also emit a safe incomplete result when possible.
Configuration evidence is bounded to 100000 bytes and 200 lines per file. The remaining-file inventory samples each unsupplied file up to 100000 bytes. Oversized samples are omitted from content and reported as a bounded sample (`at least N sampled bytes`); an exact-limit file is included, and no sample count is presented as the file's total size.
Review profiles use package metadata, implementation files, test files, and Markdown files. CodeScope never runs tests in the target repository and never includes test execution results in provider context. Repository owners and separate validation tooling own test execution.
Evidence and request-construction failures also emit a safe incomplete result when possible.

Use `--effort=none|low|medium|high|xhigh|max` or the equivalent separated form `--effort <value>` wherever scalar options are accepted to override the default reasoning effort (`none`). The same equals and separated forms are supported for `--model`.
Use `--model=gpt-5.6-luna|gpt-5.6-terra|gpt-5.6-sol` to override the default model.
The separated equivalent is `--model gpt-5.6-luna`.


## Security and operations

Do not place credentials, tokens, `.env` files, or runtime state in the repository. Codescope is read-only: it analyzes files and writes one completed structured result without modifying the reviewed repository.
CodeScope reviews supplied repository files only; it does not execute repository commands or include test execution output. Do not run reviews against workspaces containing credentials or other sensitive values; scrub source, fixtures, and logs first. Redaction is not a guarantee that arbitrary secrets are removed. Custom prompt JSON is provider-defined and has no stable schema, so consumers must validate it themselves.
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
