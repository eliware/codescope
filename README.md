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

The tool uses built-in prompts and reads only `OPENAI_API_TOKEN` from `~/.codescope`; other uppercase assignments are ignored. That home-directory file is configuration, not part of the repository scan. It accepts dotenv-style `KEY=value` syntax, for example `OPENAI_API_TOKEN=sk-...`; on Unix, group/world-readable `~/.codescope` files are rejected. An existing nonblank process environment variable takes precedence over `~/.codescope`. A missing or blank token causes a clear error and exit code `2`. Reviews are sent to OpenAI and streamed to the terminal.

Symlink policy: file discovery includes only real filesystem entries. Any entry reported as a symbolic link is skipped, whether it is a file or directory; symlink targets are never followed, scanned, combined, or sent to OpenAI. This means a symlink to an otherwise valid source file is intentionally excluded.

Running `codescope` with no command displays the single help page. Run a profile directly from the repository directory you want to review: `codescope code`, `codescope code-docs`, `codescope code-tests`, `codescope code-tests-docs`, `codescope refactor`, `codescope architecture`, `codescope new-features`, `codescope security`, `codescope performance`, `codescope reliability`, `codescope api-design`, `codescope dependencies`, `codescope observability`, `codescope accessibility`, `codescope release`, `codescope quick-wins`, `codescope prioritize`, `codescope p0`, `codescope p0-1`, `codescope p0-2`, `codescope p0-3`, `codescope tests`, `codescope tests-docs`, or `codescope docs`. File discovery is performed internally below the current working directory. Implementation profiles select real `.mjs` files excluding `*.test.mjs`; test profiles select only `*.test.mjs`; documentation profiles select `.md` files. The `code-tests-docs` profile is exhaustive: it includes all `.mjs` files, including tests, plus all `.md` files. Symlinked files and directories are excluded by the same symlink policy. The code-only suggestion profiles send complete implementation contents to the AI and return suggestions only; they do not modify files.

`codescope --help` is the single help page. It explains what Codescope does, how files are selected and reviewed, all analysis profiles, and how to annotate intentional behavior with inline comments so it is not reported as a false positive. A profile may also be followed by `--help` to display that same page.

Append `--usage` to any review profile, for example `codescope code --usage`, to print API usage metadata after the response. The implementation-focused suggestion profiles are `architecture`, `new-features`, `security`, `performance`, `reliability`, `api-design`, `dependencies`, `observability`, `accessibility`, `release`, `quick-wins`, `prioritize`, and the `p0` through `p0-3` priority profiles.

## Security and operations

Do not place credentials, tokens, `.env` files, or runtime state in the repository. Future commands that modify files should validate inputs and provide dry-run and confirmation controls.
