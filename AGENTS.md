# AGENTS.md

## Project

This repository is `eliware/codescope`.
CodeScope reviews code and estimates token use.

## Scope and boundaries

Read README.md for repository scope and behavior.

## Layout

Read README.md and specs/README.md to find repository files.

## Development

Use Node.js 26 or later.
Use native ESM.
Keep each source and test module focused on one responsibility.

## Validation

Run `npm test` for aggregate validation.
Run `npm run lint` for lint checks.
Run `npm run audit` for dependency checks.
Run `npm run format` to format files.
Run `npm run format:check` to check formatting.

## Security

Keep credentials, secrets, private data, and runtime state out of Git.

## Changes

Keep changes in this repository scope.
Use Eliware Operations for approval before external changes.

## Application

Document entry points, workflows, settings, startup, and shutdown in README.md.
Use `src/` for implementation modules.
Use `bin/` for launchers.
Use `tests/` for tests.
Use `test-fixtures/` for test fixtures.

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## CLI

Document commands, options, arguments, defaults, errors, and exit codes in README.md.

## npm publication

Include specs/ in the npm package.
Document install, entrypoints, package contents, version guidance, and release limits in README.md.
