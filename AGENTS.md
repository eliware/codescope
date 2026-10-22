# AGENTS.md

## Project

Eliware owns `@eliware/codescope`, a CLI for code reviews and token estimates.

## Scope and boundaries

CodeScope does not edit reviewed repositories or run their tests.

## Layout

Keep implementation in `src/`, launchers in `bin/`, tests in `tests/`, and fixtures in `test-fixtures/`.

## Development

Use Node.js 26 or later and native ESM.
Keep each source and test module focused on one responsibility.

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

Document commands, options, arguments, defaults, errors, and exit codes in README.md.

## npm publication

Include `specs/` in the npm package.
Document installation, entrypoints, package files, version rules, and publication limits in README.md.
Follow Eliware Operations for release approval.
