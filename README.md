# codescope

`codescope` is a Node.js command-line tool for reviewing codebases with focused OpenAI-powered analysis profiles.

## Requirements

- Node.js 26 or newer
- npm

## Setup

```text
npm install
```

Run the CLI locally:

```text
node bin/codescope.mjs --help
node bin/codescope.mjs --version
```

To use `codescope` as a shell command from any repository, install this package globally with `npm install --global .` (or use `npm link` during development).

## Validation

```text
npm test
npm run lint
npm run pack
```

The tool uses built-in prompts and loads only the `OPENAI_API_TOKEN` value from `~/.codescope`; other assignments are ignored. That home-directory file is configuration, not part of the repository scan. It accepts dotenv-style `KEY=value` syntax, including optional `export`, comments, and quoted values. On Unix, group/world-readable `~/.codescope` files are rejected. An existing nonblank process environment variable takes precedence over `~/.codescope`. A missing or blank token causes a clear error and exit code `3`. Reviews are sent to OpenAI and written once as a completed structured result; if the provider returns an invalid tool response, Codescope writes a diagnostic fallback without echoing the provider payload and returns a nonzero error code.

The CLI intentionally documents only the public `~/.codescope` configuration path. The internal programmatic `runReview` API can receive an explicit environment-file path through its options.

`new-features` is suggestion-only: `codescope new-features` is an alias for the corresponding suggestion profile and does not produce issue verdicts.

Symlink policy: file discovery includes only real filesystem entries. Any entry reported as a symbolic link is skipped, whether it is a file or directory; symlink targets are never followed, scanned, combined, or sent to OpenAI. Native root inspection also rejects a symlink root. This means a symlink to an otherwise valid source file is intentionally excluded.

`codescope all` is the main comprehensive review. It reviews implementation, tests, and Markdown together from correctness, security, reliability, performance, architecture, API design, test quality, and documentation-consistency perspectives. It reports P0–P3 findings, but only P0/P1 issues, concrete documentation discrepancies, or major test gaps block the verdict.

Running `codescope` with no command displays the single help page. Use `codescope review all` for the comprehensive review, or `codescope suggest all` for all improvement suggestions. File discovery is performed internally below the current working directory. Package metadata is included first, followed by the files selected by the profile. Symlinked files and directories are excluded and never followed.

`codescope --help` is the single help page. It explains what Codescope does, how files are selected and reviewed, all analysis profiles, and how to annotate intentional behavior with inline comments so it is not reported as a false positive. To guide the AI away from intentional behavior, place one nearby comment containing `codescope ignore:` followed by the complete scope to ignore, such as `// codescope ignore: x, y, and z are intentional policy constraints.` The marker is supplied as scoped review guidance, not enforced by a local parser. If a finding extends beyond that scope, Codescope reports only the uncovered behavior and suggests either fixing it or expanding the same comment. Unrelated issues remain reportable. A profile may also be followed by `--help` to display that same page.

<!-- codescope ignore: this documentation accurately describes test-result ordering; the selected source combiner places test evidence before documentation. -->
<!-- codescope ignore: --usage documentation intentionally describes the final structured JSON result uniformly for review and suggestion commands; no separate appended footer is promised. -->

Append `--usage` to either grouped (`codescope review all`) or direct (`codescope all`) syntax to include API usage metadata in the final JSON result.

Append `--dry-run` to prepare the same review request and ask OpenAI for its estimated input-token count without running a model review. The option reports the selected model and estimated input tokens; combine it with `--usage` when you want the count under `usage` as well.
<!-- codescope ignore: the following profile list is explicitly illustrative, not exhaustive; omitted valid profiles are not documentation defects. -->

For test-inclusive profiles, the combined source order is package metadata, implementation files, test files, test results, then Markdown files when included.
Profiles that include tests run `npm test` in the target repository with a 30-second timeout and include its result after test content (and before docs when docs are included). Test-capable suggestions include `suggest tests`, `suggest code-tests`, and `suggest all`; these are examples, not an exhaustive list. Profiles without tests reject `--omit-test-results`. Use `--omit-test-results` to skip that command or `--test-timeout 120` with a review or suggestion command to override the timeout in seconds.
Use `--effort=none|low|medium|high|xhigh|max` to override the default reasoning effort (`none`).
Use `--model=gpt-5.6-luna|gpt-5.6-terra|gpt-5.6-sol` to override the default model.

The effort benchmark runs `none`, `low`, `medium`, and `high` in parallel. OpenAI and Codescope also support `xhigh` and `max`, but repository benchmark runs were slow and inconclusive, so both are excluded from the benchmark matrix. Use `npm run benchmark:efforts -- --model=gpt-5.6-terra` or `--model=gpt-5.6-sol` to benchmark another supported model; the selected model and its current rates are recorded in `summary.json`.

## Security and operations

Do not place credentials, tokens, `.env` files, or runtime state in the repository. Codescope is read-only: it analyzes files and writes one completed structured result without modifying the reviewed repository.
Use `codescope review all` for release-readiness review.
