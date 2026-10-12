# AGENTS.md

## Project

This repository is `eliware/codescope`.
CodeScope reviews code and estimates token use.

## Scope and boundaries

Use README.md for repository scope and product behavior.

## Layout

Use README.md and specs/README.md to find repository files.

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

Keep credentials, secrets, private data, and runtime state out of Git.

## Changes

Keep changes within this repository scope.
Use Eliware Operations for approval before external changes.

## Application

Document entrypoints, workflows, settings, startup, and shutdown in README.md.

## CLI

Document commands, options, arguments, defaults, errors, and exit codes in README.md.

## npm publication

Include specs/ in the npm package.
Document install, entrypoints, package contents, version guidance, and release limits in README.md.
