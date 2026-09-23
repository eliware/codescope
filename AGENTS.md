# CodeScope repository guidance

Applies to: the entire repository unless a more specific AGENTS.md exists.

## Instruction scope

These instructions apply repository-wide. Subdirectory instructions may add
more specific guidance but may not weaken these requirements.

## Read before changing

Read `README.md`, this file, and relevant `docs/` and `specs/` records before
changing files.

## Repository identity

Project: `eliware/codescope`. Runtime: Node.js 26, native ESM.

## Purpose and scope

CodeScope is a public Node.js 26 native-ESM CLI for read-only, AI-assisted
repository reviews and suggestions. This repository owns the CLI, its profiles,
supplied-evidence conventions, specifications, tests, and package metadata. It
does not own reviewed-repository implementation, deployment, or publication
state.

## Scope and boundaries

Keep implementation under `src/`, the process entrypoint under `bin/`,
end-user guidance under `docs/`, and normative CodeScope records under `specs/`.
Do not copy shared convention requirements into local contracts.

## Required structure

Maintain `README.md`, `AGENTS.md`, `package.json`, `.knit/`, `docs/README.md`,
`specs/README.md`, `src/`, `tests/`, and the indexed metadata required by the
applicable convention profiles.

## Authoritative sources

Read `eliware/docs` for shared documentation and authority mapping, `eliware/conventions`
for repository requirements, and `eliware/operations` for cross-cutting release
and operational procedures. CodeScope specifications own CodeScope behavior and
APIs; shared conventions remain authoritative for repository requirements.

## Runtime and entrypoints

Use Node.js 26 with native ESM. The public entrypoint is `bin/codescope.mjs`;
the package command is `codescope`. Supported commands include `codescope all`,
review and suggestion profiles, `codescope prompt`, `--help`, and `--version`.

## Validation

Use Node.js 26 with npm and native ESM modules. The required environment is
Node.js 26 with npm available on PATH. Use `npm ci`, `npm test`, `npm run lint`,
`npm run audit`, `npm run pack`, and `npm run format:check`. These commands are
provided by `eliware-test`; do not invoke Jest, Oxlint, Prettier, or audit
commands directly. The Knit validation entrypoint is `.knit/validate.mjs`.
Tests must maintain 100% statements, branches, functions, and lines for
in-scope production logic. CI validates on Ubuntu and Windows; publication
requires the separate Ubuntu validation result and an exact version tag.

## Security and secrets

Never commit credentials, tokens, `.env` files, runtime output, or machine state.
Keep secrets in user-owned configuration and keep examples free of credentials.
These instructions are actionable, current, concise, and project-specific.
The package is public and uses provenance publication with exact version tags.
Do not publish, deploy, tag, or push without explicit authorization.

## Approved deviations

The temporary pre-release validator migration exception is recorded in
`package.json.eliware.exempt` and expires on 2026-09-30.

## Change control and authorization

Do not commit, publish, deploy, tag, or push unless explicitly authorized for
the current task. Keep changes scoped and preserve unrelated work.

## Application and CLI concerns

Validate configuration before creating the provider client, keep shutdown and
signal cleanup repeatable, and test externally observable CLI workflows. The
CLI entrypoint is `bin/codescope.mjs`; supported commands, help, version,
platform behavior, and exit-code meanings are documented in the root README
and `docs/quick-start.md`. CodeScope is read-only and does not publish or
deploy.

## Subdirectory instructions

No subdirectory-specific instructions currently override this file.
