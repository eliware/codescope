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
Supported commands include `codescope all`,
review and suggestion profiles, `codescope prompt`, `--help`, and `--version`.
Read `README.md`, relevant `docs/`, and relevant `specs/` records before
changing files. Read `eliware/docs` for authority mapping,
`eliware/conventions` for applicable repository requirements, and
`eliware/operations` for operational procedures. These repository-wide
instructions are actionable, current, concise, and project-specific. A
subdirectory instruction may add detail but may not weaken them.

## Validation

Use the global `eliware-test` validator for `npm ci`, tests, lint, audit, pack,
and formatting checks in the Node.js 26 validation environment; do not invoke
Jest, Oxlint, Prettier, or audit tools directly. Maintain 100% statements,
branches, functions, and lines for in-scope production logic. The Knit
validation entrypoint is `.knit/validate.mjs`, and applicable application
requirements are supplied by the selected Convention directives.

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
