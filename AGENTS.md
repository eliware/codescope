# AGENTS.md

## Project

Purpose: `eliware/codescope` is a read-only review CLI. It uses Node.js 26 and native ESM.
The entry point is `bin/codescope.mjs`. The command is `codescope`.
CodeScope reviews supplied repository evidence. It also gives suggestions and token estimates.

## Scope and boundaries

CodeScope owns its CLI, profiles, evidence rules, specifications, tests, and package data.
It does not own reviewed code, shared repository rules, Operations, releases, deployment, or Test8.
Eliware Test remains the authority for shared repository requirements.
These instructions apply repository-wide. Subdirectory instructions may add specific guidance but may not weaken these requirements.
This section states which instructions apply repository-wide and which apply to subdirectories.
Use these instructions for every subdirectory unless a nearer `AGENTS.md` adds detail.

## Layout

Keep this required structure. Put runtime code in `src/`. Put the CLI entry point in `bin/`.
Keep user guides in `docs/`, CodeScope rules in `specs/`, and checks in `tests/`.
Keep `README.md`, `AGENTS.md`, `package.json`, `.knit/`, `docs/README.md`, and `specs/README.md` current.

## Development

These development rules apply repository-wide and to subdirectory instructions.
Use Node.js 26, npm, and native ESM modules.
Before a change, read `README.md`, applicable `AGENTS.md` files, and applicable documentation and specifications.
Read [Eliware Docs](https://github.com/eliware/docs) for authority rules.
Read [Eliware Test conventions](https://github.com/eliware/test/blob/main/specs/conventions/README.md) for shared repository rules.
Read [Eliware Operations](https://github.com/eliware/operations/blob/main/README.md) for procedures.
Keep these instructions actionable, current, concise, and project-specific.

Project rules may add shared rules. They must not weaken shared rules without authorization.

Give each source file and its test one cohesive purpose and one reason to change.
Business-logic modules and coordinators are valid when each has one responsibility.
This includes coordinators of coordinators.
Put every distinct responsibility in a focused submodule with a mirrored test.
Wire each submodule through its owner.
Do not add the new responsibility to an existing module for convenience.
Refactor them during ordinary review when you find mixed responsibilities.

The limits are 100 source lines and 200 test lines.
Passing them does not prove single responsibility or permit mixed responsibilities below the limits.

## Validation

Use package scripts for validation. Run `npm ci` after dependency changes.
Run `npm test`, `npm run lint`, `npm run audit`, `npm run pack`, and `npm run format:check` for full validation.
`npm test` runs the aggregate validation.
Keep 100% statement, branch, function, and line coverage for production code in scope.
Deployment commands are in `.knit/deploy.yaml`.

## Security

Never commit credentials, tokens, `.env` files, runtime output, or machine state.
Keep secrets in user-owned configuration. Keep examples free of credentials.
CodeScope reads supplied evidence and writes its own output.
It does not change reviewed repositories or run their commands or tests.
Check configuration, shutdown, signal cleanup, and visible workflows.

## Changes

Do not commit, publish, deploy, tag, or push without clear authorization for this task.
Keep changes within the request. Preserve unrelated work.
Do not copy Eliware Test rules into local directives.
Check repeatable shutdown and signal cleanup when you change related code.
No approved exception to shared Eliware Test requirements exists.

## Application

The executable is `bin/codescope.mjs`. The package command is `codescope`.
The package export is `src/cli/main.mjs`.

Review, suggestion, and custom-prompt commands load configuration before they create a provider client.
Each command makes one request. It writes the result, stops its controller, and removes signal handlers.
Help and version commands exit before configuration or provider setup.
Support repeatable shutdown and signal cleanup. These rules define the application workflow boundary.

Use only `OPENAI_API_TOKEN` as a runtime environment setting.
A nonblank process value takes priority over a nonblank value in `~/.codescope`.
The default model is `gpt-6-luna`.
CodeScope reviews supplied evidence and does not change the reviewed repository.

## CLI

The CLI entrypoint is `bin/codescope.mjs`. It runs the `codescope` command.
Document exit-code meanings and mappings for every public command.

Public commands are:

- `codescope all`
- `codescope release`
- `codescope review <profile>`
- `codescope suggest <profile>`
- `codescope prompt <text>`
- Supported direct profile names
- `codescope --help`
- `codescope --version`

Profile commands accept repeatable `-a|--add <text>`, `-a=<text>`, and `--add=<text>`.
They also accept `--effort <value>`, `--effort=<value>`, `--model <value>`, and `--model=<value>`.
They support `--usage`, `--dry-run`, and `--debug-request`.
Custom prompts support `--debug-request`.

Effort values are `none`, `low`, `medium`, `high`, `xhigh`, and `max`.
Supported models are `gpt-6-astra`, `gpt-6-sol`, `gpt-6-luna`, `gpt-5.6-luna`, `gpt-5.6-terra`, and `gpt-5.6-sol`.
Put prompt additions before an optional `--` delimiter.
After `--`, use only effort, model, and debug options.
If prompt text starts with `-`, use `--`.

Supported platforms: Windows and Linux use the same command syntax.
Validation evidence: CI checks Ubuntu only. It does not check Windows.
State which platform checks ran and which platform support is inferred.
Contributors run the global `eliware-test` validator.
CI installs the latest npm, then runs `npm ci` and `npm test` on Ubuntu.

Profile commands default to `gpt-6-luna`, effort `none`, a live request, no usage report, and no added text.
Issue reviews send reasoning summary `auto` by default.
`--debug-request` prints issue-review requests before send and responses after receipt.
Use labels `--- REVIEW REQUEST ---` and `--- REVIEW RESPONSE ---`.
Suggestions and custom prompts print their single request and response.
Debug output can contain repository evidence.
Run `codescope` without a command to show help. Run `codescope all` for a full review.

Exit code mapping: successful commands exit with `0`, even when issues exist.
Usage errors exit with `2`. Configuration errors exit with `3`.
Input errors exit with `4`. Provider errors exit with `5`.
Invalid provider responses exit with `6`. Other errors exit with `4`.
Request and transport timeouts exit with `124`.
SIGINT exits with `130`. SIGTERM exits with `143`.
CodeScope is read-only. It has no destructive review action.

## npm publication

The public package is `@eliware/codescope`.
`package.json` is the source for its version.
The repository is <https://github.com/eliware/codescope>.

The exact `package.json.files` allowlist is `src/`, `docs/`, `README.md`, `AGENTS.md`, `LICENSE`, `RELEASE_NOTES.md`, and `bin/`.

The pack command is `eliware-test --pack`.
Package checks must pass before publication.

`publishConfig.provenance` is `true`.
The publish workflow uses npm provenance after Ubuntu validation passes.
It also requires one `v#.#.#` tag at `HEAD` that matches `package.json`.
After publication, the release operator checks the exact version and commit at <https://registry.npmjs.org>.

Release approval and execution ownership: Eli and the project developer run TagIt preflight together.
Eli decides if the release is ready and instructs DevOps.
DevOps executes the release through the Eliware Operations handoff.
Release authorization and handoff: this file and a passing workflow do not authorize publication.
Publication requires clear authorization through the Eliware Operations release handoff.
