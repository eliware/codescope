# AGENTS.md

## Project

Purpose: `eliware/codescope` is a public Node.js 26 native-ESM CLI for read-only,
AI-assisted repository reviews, suggestions, and token estimates. The public
entrypoint is `bin/codescope.mjs` and the package command is `codescope`.

## Scope and boundaries

CodeScope owns its CLI, profiles, supplied-evidence conventions, specifications,
tests, and package metadata. It does not own reviewed-repository
implementation, Operations procedures, deployment, publication, or Test8
behavior. Shared repository requirements remain authoritative in
`eliware/conventions`.

These instructions apply repository-wide. Subdirectory instructions may add
specific guidance but may not weaken these requirements.

## Layout

Keep runtime implementation under `src/`, the process entrypoint under `bin/`,
end-user guidance under `docs/`, normative CodeScope directives under `specs/`,
and verification under `tests/`. This repository structure is intentional.
Maintain `README.md`, `AGENTS.md`,
`package.json`, `.knit/`, `docs/README.md`, and `specs/README.md`.

## Development

Use Node.js 26, npm, and native ESM modules in the required environment.
Read `README.md`, relevant `docs/`, and relevant `specs/` records before
changing files. Read `eliware/docs` for authority mapping,
`eliware/conventions` for applicable repository requirements, and
`eliware/operations` for operational procedures. These repository-wide
instructions are actionable, current, concise, and project-specific. A
subdirectory instruction may add detail but may not weaken them.

## Validation

Run only the global symlinked `eliware-test` v8.0.0 by invoking the bare
`eliware-test` command. Do not use `npm test`, the repository-local
`@eliware/test` 6.0.1 dependency, or Jest, Oxlint, Prettier, and audit tools
directly. The global validator owns installation, tests, lint, audit, pack, and
format checks. Maintain 100% statements, branches, functions, and lines for
in-scope production logic. The Knit validation entrypoint is
`.knit/validate.mjs`.

## Security

Never commit credentials, tokens, `.env` files, runtime output, or machine
state. Keep secrets in user-owned configuration and examples free of
credentials. CodeScope is read-only against reviewed repositories; validate
configuration, shutdown, signal cleanup, and externally observable workflows.

## Changes

Do not commit, publish, deploy, tag, or push without explicit authorization for
the current task. Keep changes scoped, preserve unrelated work, and do not
copy shared Convention requirements into local directives. Runtime workflow
concerns include repeatable shutdown and signal cleanup.

The temporary pre-release validator migration exception is recorded in
`package.json.eliware.exempt` and expires on 2026-09-30.

## Application

The application entrypoint is `bin/codescope.mjs`, exposed as the `codescope`
package command; the package root export is `src/cli/main.mjs`. Each invocation
loads configuration, runs one review or suggestion request, writes the result,
then aborts its controller and removes signal handlers. Runtime configuration
uses only `OPENAI_API_TOKEN`: a nonblank process value takes precedence over a
nonblank value in `~/.codescope`. The default model is `gpt-6-luna`; there are
no other supported runtime environment settings. The CLI reviews supplied
repository evidence without modifying the reviewed repository.

## CLI

The public commands are `codescope all`, `codescope review <profile>`,
`codescope suggest <profile>`, `codescope prompt <text>`, supported direct
profile shorthand, `codescope --help`, and `codescope --version`. Profile
commands accept repeatable `-a|--add <text>`, model and effort selection,
usage reporting, and dry-run estimates. Prompt text beginning with `-`
requires `--`; after that delimiter only supported effort and model options
are accepted. The executable is `bin/codescope.mjs`; the package command is
`codescope`. Windows uses the same Node.js command syntax, but CI currently
validates Ubuntu only.

Successful commands exit `0`; usage, configuration, input, provider, and
response errors exit `2`, `3`, `4`, `5`, and `6`; timeout and termination exits
are `124`, `130` (SIGINT), and `143` (SIGTERM). Provider findings and verdicts
do not affect the exit code. CodeScope is read-only and has no destructive
review action.

## npm publication

The public package is `@eliware/codescope`; `package.json` is the source of its
version, and the repository URL is `https://github.com/eliware/codescope`. Its
package files allowlist is `bin/`, `src/`, `README.md`, `docs/`, `prompts/`,
`specs/`, `KNOWN_ISSUES.md`, `NEW_FEATURE_SUGGESTIONS.md`, `LICENSE`, and
`RELEASE_NOTES.md`. The package `pack` script is exactly
`eliware-test --pack`; the global v8 validator's pack stage must pass.

`publishConfig.provenance` is `true`; the separate
`.github/workflows/publication.yml` publishes with npm provenance only after
Ubuntu validation succeeds and the sole tag at `HEAD` exactly matches the
`v#.#.#` form and `package.json` version. After publication, the authorized
release operator verifies that the exact `@eliware/codescope@<version>` and
release commit are visible in the npm registry; the current workflow does not
perform this post-publication check itself.

Publication requires Eli's explicit release instruction after passing
TagIt preflight, followed by the DevOps release handoff. DevOps owns publication
execution. This file and a passing workflow are not publication authorization.
