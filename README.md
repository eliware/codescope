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

- Focused review and suggestion profiles for architecture, security, reliability, performance, API design, dependencies, and release readiness.
- Comprehensive `all` reviews that combine implementation, tests, and Markdown into one structured JSON result.
- Token and cost estimates, model selection, reasoning-effort controls, and configurable test timeouts.
- Symlink-safe discovery and inline `codescope ignore:` guidance for intentional behavior.
- Read-only analysis that does not modify the reviewed repository.

## Requirements

- Node.js 26 or newer
- npm

## Installation

```text
npm install
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

## Configuration

The CLI stores only `OPENAI_API_TOKEN` from `~/.codescope`. Its dotenv parser accepts assignment syntax, including optional `export`, comments, and quoted values; every assignment other than `OPENAI_API_TOKEN` is ignored, including duplicate non-token assignments. An existing nonblank process environment variable takes precedence. On Unix, group/world-readable configuration files are rejected. A missing or blank token causes a clear error and exit code `3`.

## Validation

```text
npm test
npm run lint
npm run pack
```

`npm run pack` performs a local `npm pack --dry-run` validation of the publishable file set. Its output is not automatically sent to OpenAI; provide that evidence separately when a review needs to assess package contents.

Reviews use built-in prompts and write one completed structured result; invalid provider tool responses received after the request produce a diagnostic fallback without echoing the provider payload and return a nonzero error code.

The CLI intentionally documents only the public `~/.codescope` configuration path. The internal programmatic `runReview` API can receive an explicit environment-file path through its options.

`new-features` is suggestion-only: `codescope new-features` is an alias for the corresponding suggestion profile and does not produce issue verdicts.

Symlink policy: file discovery includes only real filesystem entries. Any entry reported as a symbolic link is skipped, whether it is a file or directory; symlink targets are never followed, scanned, combined, or sent to OpenAI. Native root inspection also rejects a symlink root. This means a symlink to an otherwise valid source file is intentionally excluded.

`codescope all` is the main comprehensive review and suggestion command. It reviews package metadata, all `.js`, `.mjs`, `.cjs`, and `.ts` implementation files, all `.test.js`, `.test.cjs`, and `.test.mjs` test files, Markdown, and a names-only inventory of other repository files together. Git metadata, dependencies, coverage output, and coverage data are excluded. It makes exactly one review-tool call and one suggestion-tool call in parallel, and merges both into one JSON result. It reports P0–P3 findings, but only unresolved P0 or qualifying P1 issues block the verdict.

Running `codescope` with no command displays the single help page. Use `codescope review all` for the comprehensive review, or `codescope suggest all` for all improvement suggestions. File discovery is performed internally below the current working directory. Package metadata is included first, followed by the files selected by the profile. Symlinked files and directories are excluded and never followed.

`codescope --help` is the single help page. It explains what Codescope does, how files are selected and reviewed, all analysis profiles, and how to annotate intentional behavior with inline comments so it is not reported as a false positive. To guide the AI away from intentional behavior, place one nearby comment containing `codescope ignore:` followed by the complete scope to ignore, such as `// codescope ignore: x, y, and z are intentional policy constraints.` The marker is supplied as scoped review guidance, not enforced by a local parser. If a finding extends beyond that scope, Codescope reports only the uncovered behavior and suggests either fixing it or expanding the same comment. Unrelated issues remain reportable. A profile may also be followed by `--help` to display that same page.

<!-- codescope ignore: this documentation accurately describes test-result ordering; the selected source combiner places test evidence before documentation. -->
<!-- codescope ignore: --usage documentation intentionally describes the final structured JSON result uniformly for review and suggestion commands; no separate appended footer is promised. -->

Append `--usage` to either grouped (`codescope review all`) or direct (`codescope all`) syntax to include API usage metadata in the final JSON result.

Append `--dry-run` to prepare the same review request and ask OpenAI for its estimated input-token count without running a model review. The option reports the selected model and estimated input tokens; combine it with `--usage` when you want the count under `usage` as well.

When `--usage` is enabled, the result includes `estimated_cost_usd` calculated from the selected model’s input, cached-input, cache-write, output, and long-context rates. `--dry-run` reports input-token cost only because no output is generated.
<!-- codescope ignore: the following profile list is explicitly illustrative, not exhaustive; omitted valid profiles are not documentation defects. -->

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
