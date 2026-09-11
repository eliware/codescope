# codescope repository guidance

Applies to: the entire repository unless a more specific AGENTS.md exists in a
subdirectory.

## Runtime and source

- Use Node.js 26, `type: module`, native ESM, and `.mjs` files.
- Keep production code under `src/` and `bin/codescope.mjs` limited to process wiring.
- Keep modules cohesive: one meaningful responsibility per module. Use explicit orchestrators for coordination; do not add monolithic modules or hide independent responsibilities behind comments.
- Validate before side effects, inject external effects where practical, preserve error context, and make cleanup repeatable and idempotent.
- Keep public exports, package metadata, `exports`, declarations when applicable, README, lockfile, and package-file allowlists synchronized.

## Tests and validation

- Put tests under `tests/` mirroring the `src/` hierarchy exactly, with only the `.test` suffix added. Avoid catch-all tests; place cross-module tests at the lowest common composition level.
- Use `@eliware/test` for `npm test` and `npm run lint`.
- Require 100% statements, branches, functions, and lines for in-scope non-barrel production logic. Do not add Istanbul ignores; refactor or test the code instead. Istanbul ignores are allowed only in pure barrel/re-export files.
- 100×4 coverage does not replace contract, regression, integration, smoke, or E2E tests where those checks are needed.
- Before handoff run `npm test` and `git diff --check`. Use focused tests while iterating, then run the full suite once; `npm test` owns the shared lint and format checks.
- Use Node process APIs and argument arrays; avoid shell-specific pipelines, quoting, `grep`, or platform-specific executable assumptions.

## Shared libraries

- Prefer the narrowest maintained Eliware package over local duplicate implementations. Use `@eliware/common` for logging, path, error, and lifecycle APIs; do not add direct dependencies or imports for `@eliware/log`, `@eliware/path`, `@eliware/errors`, or `@eliware/signals`.
- Use `@eliware/openai` for OpenAI integration when applicable. Document justified exceptions rather than silently retaining overlapping local helpers.

## Documentation and safety

- Public npm publication requirements apply to this package: maintain the
  package allowlist, provenance metadata, pack and audit checks, and exact-tag
  publication workflow.

- README must document purpose, setup, configuration, validation, security, and operations. Keep examples runnable, safe, and free of credentials or local machine paths.
- Record user-visible changes in `RELEASE_NOTES.md`. Keep commands, profiles, examples, exports, and metadata synchronized.
- Never commit secrets, tokens, keys, `.env` files, decrypted data, coverage artifacts, or runtime state. Use secure defaults and least privilege.
- Keep changes scoped and avoid unrelated formatting churn.

## CLI and operations

- Preserve stable `--help`, `--version`, exit codes, safe output, and dry-run controls.
- This CLI is read-only against reviewed repositories; do not add deployment behavior to the generic test command.
- If Knit configuration is changed, keep `.knit/deploy.yaml` as the single source of truth for explicit target, working directory, and ordered commands. Do not hide repository-specific deployment commands in other configuration.

## Git and release boundaries

- Check status before and after work. Use focused commits and keep each commit independently understandable with its matching tests/docs.
- Do not push, release, deploy, tag, publish, or rewrite history without explicit authorization. Commits are also authorization-sensitive and require an explicit user request.
- Follow the canonical shared release flow for exact-version approval, validation, publication, and rollback; do not invent a local release process.
