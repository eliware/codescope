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
`eliware/test`.

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
Before changing files, read `README.md`, applicable `AGENTS.md` instructions,
and applicable documentation in `docs/` and `specs/`. Read `eliware/docs` for authority mapping,
`eliware/test` for applicable repository requirements, and
`eliware/operations` for operational procedures. These repository-wide
instructions are actionable, current, concise, and project-specific. A
subdirectory instruction may add detail but may not weaken them.

Design source modules and tests with single responsibility: each has one
cohesive purpose and one reason to change. A module and its mirrored test
should each have one distinct responsibility. Business-logic modules and
coordinators, including coordinators of coordinators, are valid when each does
only its own responsibility. Put every distinct new responsibility into a
focused submodule wired through its owner. Do not add the new responsibility to
an existing module for convenience. Refactor them during ordinary review when
you notice mixed responsibilities. Line counts do not establish single
responsibility or permit mixing responsibilities below any applicable
blocking maxima. Do not permit mixed responsibilities below those limits.
The limits are 100 source lines and 200 test lines; passing them does not prove single responsibility.

## Validation

Use Node.js 26 with npm and native ESM. Run `npm ci`, `npm test`,
`npm run lint`, `npm run audit`, `npm run pack`, and `npm run format:check` for
repository validation. Use the package scripts rather than invoking their
underlying test, lint, audit, or formatting tools directly. Maintain 100%
statements, branches, functions, and lines for in-scope production logic. Knit
deployment commands are defined in `.knit/deploy.yaml`.

## Security

Never commit credentials, tokens, `.env` files, runtime output, or machine
state. Keep secrets in user-owned configuration and examples free of
credentials. CodeScope is read-only against reviewed repositories; validate
configuration, shutdown, signal cleanup, and externally observable workflows.

## Changes

Do not commit, publish, deploy, tag, or push without explicit authorization for
the current task. Keep changes scoped, preserve unrelated work, and do not
copy shared Eliware Test requirements into local directives. Runtime workflow
concerns include repeatable shutdown and signal cleanup.
No intentional deviations from shared Eliware Test requirements are currently approved.

## Application

The application entrypoint is `bin/codescope.mjs`, exposed as the `codescope`
package command; the package root export is `src/cli/main.mjs`. Provider-backed
review and suggestion commands load configuration, run one request, write the
result, then abort their controller and remove signal handlers. Help and version
commands exit before review configuration or provider setup. Runtime configuration
uses only `OPENAI_API_TOKEN`: a nonblank process value takes precedence over a
nonblank value in `~/.codescope`. The default model is `gpt-6-luna`; there are
no other supported runtime environment settings. The CLI reviews supplied
repository evidence without modifying the reviewed repository.

## CLI

The public commands are `codescope all`, `codescope release`, `codescope review <profile>`,
`codescope suggest <profile>`, `codescope prompt <text>`, supported direct
profile shorthand, `codescope --help`, and `codescope --version`. Profile
commands accept repeatable `-a|--add <text>` and `-a=<text>` or `--add=<text>`,
plus `--effort <value>` / `--effort=<value>`, `--model <value>` /
`--model=<value>`, `--usage`, and `--dry-run`. Effort values are `none`, `low`,
`medium`, `high`, `xhigh`, and `max`; supported models are `gpt-6-astra`,
`gpt-6-sol`, `gpt-6-luna`, `gpt-5.6-luna`, `gpt-5.6-terra`, and `gpt-5.6-sol`.
Prompt additions must precede an optional `--` delimiter; after it, only effort
and model options are accepted. Prompt text beginning with `-` requires `--`.
The executable is `bin/codescope.mjs`; the package command is `codescope`.
Supported platforms: the CLI uses the same Node.js command syntax on Windows
and Linux. CI directly validates Ubuntu only; Windows is not covered by the
supplied workflow.
Validation evidence: contributors run the global `eliware-test` validator;
CI directly validates Ubuntu after installing the latest npm, then running
`npm ci` and `npm test`. Windows is not directly validated by CI.

Profile commands default to `gpt-6-luna`, the selected model's default
reasoning effort, a live request, no usage report, and no added prompt text.
Invoking `codescope` without a command displays help; `codescope all` selects
the comprehensive review profile.

Exit code mapping: successful commands exit `0`, including reviews that return findings or a
negative verdict. Usage errors exit `2`, configuration errors `3`, recognized
input errors `4`, provider/API request errors `5`, and invalid provider
responses `6`. Errors without a more specific classification also fall back to
status `4`. Request and transport timeouts exit `124`; SIGINT and SIGTERM exit
`130` and `143`, respectively.
CodeScope is read-only and has no destructive review action.

## npm publication

The public package is `@eliware/codescope`; `package.json` is the source of its
version, and the repository URL is `https://github.com/eliware/codescope`. Its
package files allowlist is `src/`, `docs/`, `README.md`, `AGENTS.md`, `LICENSE`,
`RELEASE_NOTES.md`, and `bin/`. The package `pack` script is `eliware-test --pack`, and
package-artifact validation must pass before publication.

`publishConfig.provenance` is `true`; the separate
`.github/workflows/publish.yaml` publishes with npm provenance only after
Ubuntu validation succeeds and the sole tag at `HEAD` exactly matches the
`v#.#.#` form and `package.json` version. After publication, the authorized
release operator verifies that the exact `@eliware/codescope@<version>` and
release commit are visible at `https://registry.npmjs.org` for the exact
`package.json` version; the current workflow does not perform this
post-publication check itself.

Eli and the project developer run TagIt preflight together. Eli decides whether
the release is ready and instructs DevOps; DevOps executes the authorized release
through the Operations release handoff. This file and a passing workflow are not
publication authorization.
