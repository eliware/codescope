# AGENTS.md

## Project

Eliware owns `@eliware/codescope`, a CLI for code reviews and token estimates.

## Scope and boundaries

CodeScope does not edit reviewed repositories.
CodeScope does not run tests in reviewed repositories.

## Layout

Keep implementation in `src/`.
Keep launchers in `bin/`.
Keep tests in `tests/`.
Keep fixtures in `test-fixtures/`.

## Development

Use Node.js 26 or later and native ESM.

## Validation

Run `npm test` for aggregate validation.
Run `npm run lint` for lint checks.
Run `npm run audit` for dependency checks.
Run `npm run format` to format files.
Run `npm run format:check` to check formatting.

## Security

Keep credentials, secrets, and private data out of Git.

## Changes

Keep changes in this repository.

## Application

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.

## CLI

Document command purpose, syntax, options, arguments, defaults, and exit codes in `README.md`.

## npm publication

Include `specs/` in the npm package.
Document installation, entrypoints, package files, version rules, and publication limits in `README.md`.
