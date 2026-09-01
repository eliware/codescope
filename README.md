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

The tool uses its built-in prompts and reads only `OPENAI_API_TOKEN` from `~/.codescope`; other uppercase assignments are ignored. That home-directory file is configuration, not part of the repository scan. It uses simple dotenv-style `KEY=value` syntax, for example `OPENAI_API_TOKEN=sk-...`; `chmod 600 ~/.codescope` is recommended on Unix but is not enforced. Existing process environment variables take precedence over `~/.codescope`. A missing or blank token causes a clear error and exit code `2`. Reviews are sent to OpenAI and streamed to the terminal.

Symlink policy: file discovery includes only real filesystem entries. Any entry reported as a symbolic link is skipped, whether it is a file or directory; symlink targets are never followed, scanned, combined, or sent to OpenAI. This means a symlink to an otherwise valid source file is intentionally excluded.

Running `codescope` with no command displays the single help page. Run a profile directly from the repository directory you want to review: `codescope implementation`, `codescope implementation-docs`, `codescope implementation-tests`, `codescope all`, `codescope tests`, `codescope tests-docs`, or `codescope docs`. File discovery is performed internally below the current working directory; test files mean only `*.test.mjs`, and symlinked test files or directories are excluded by the same symlink policy.

`codescope --help` is the single help page. It explains what Codescope does, how files are selected and reviewed, all analysis profiles, and how to annotate intentional behavior with inline comments so it is not reported as a false positive.

## Security and operations

Do not place credentials, tokens, `.env` files, or runtime state in the repository. Future commands that modify files should validate inputs and provide dry-run and confirmation controls.
