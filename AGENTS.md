# AGENTS.md

## Project

Purpose: `eliware/codescope` is a public Node.js 26 command-line tool. It uses native ECMAScript modules. It reviews supplied repository evidence without changes. It also gives suggestions and token estimates. The entry point is `bin/codescope.mjs`. The command is `codescope`.

## Scope and boundaries

CodeScope owns its command-line tool, profiles, evidence rules, specifications, tests, and package data. It does not own reviewed code, Operations procedures, releases, publication, deployment, or Test8 behavior. Shared repository rules in Eliware Test remain authoritative.

These instructions apply repository-wide. Subdirectory instructions may add specific guidance but may not weaken these requirements.

## Layout

Put runtime code in `src/`. Put the command entry point in `bin/`. Put user guidance in `docs/`. Put CodeScope rules in `specs/`. Put checks in `tests/`. Keep this structure.

Keep `README.md`, `AGENTS.md`, `package.json`, `.knit/`, `docs/README.md`, and `specs/README.md` current.

## Development

Use Node.js 26, npm, and native ESM modules. Before a change, read `README.md`, applicable `AGENTS.md` instructions, and applicable documentation in `docs/` and `specs/`. Read Eliware Docs for authority rules. Read Eliware Test for repository rules. Read Eliware Operations for procedures. Keep these instructions actionable, concise, current, and project-specific.

These instructions apply repository-wide. Subdirectory instructions may add detail. They cannot weaken these rules.

Give each source file and its test one single responsibility: one cohesive purpose and one reason to change. Business-logic modules and coordinators are valid, including coordinators of coordinators, when each module does only its own responsibility.

Put every distinct responsibility in a focused submodule wired through its owner. Add a mirrored test. Do not add the new responsibility to an existing module for convenience. During ordinary review, refactor them when you notice mixed responsibilities.

Line counts do not establish single responsibility. The limits are 100 source lines and 200 test lines. Passing them does not prove single responsibility or permit mixed responsibilities below these limits.

## Validation

Use Node.js 26 with npm and native ESM. Validate with Node.js 26. Run `npm ci`, `npm test`, `npm run lint`, `npm run audit`, `npm run pack`, and `npm run format:check` for full validation.

Use package scripts. Do not call their underlying test, lint, audit, or format tools directly. Keep 100% statement, branch, function, and line coverage for production code in scope.

Deployment commands are in `.knit/deploy.yaml`.

## Security

Never commit credentials, tokens, `.env` files, runtime output, or machine state. Keep secrets in user-owned configuration. Do not put credentials in examples.

CodeScope is read-only against reviewed repositories. It reads supplied evidence and writes its output. It does not modify reviewed repositories or execute their commands or tests. It does not publish or deploy reviewed code. This defines its observable workflow boundary. Check configuration, shutdown, signal cleanup, and visible workflows.

## Changes

Do not commit, publish, deploy, tag, or push without clear authorization for the current task. Keep changes within the requested scope. Preserve unrelated work.

Do not copy shared Eliware Test rules into local directives. Check that shutdown can run more than once and that signal cleanup works.

No approved exception to shared Eliware Test rules exists.

## Application

The executable entrypoint is `bin/codescope.mjs`. It runs the package command `codescope`. The package export is `src/cli/main.mjs`.

Review, suggestion, and custom-prompt commands validate configuration before creating the provider client. Each command makes one request. Each command writes the provider result, stops its controller, and removes signal handlers. The lifecycle must support repeatable shutdown and signal cleanup. This defines the application boundary.

Help and version commands exit before configuration or provider setup. Runtime environment settings: only `OPENAI_API_TOKEN`. A nonblank process value takes precedence over a nonblank value in `~/.codescope`. Package metadata and CLI arguments are not runtime environment settings.

The default model is `gpt-6-luna`. CodeScope reviews supplied evidence. It does not change the reviewed repository.

## CLI

The CLI executable entrypoint is `bin/codescope.mjs`. It runs package command `codescope`.

Public commands are `codescope all`, `codescope release`, `codescope review <profile>`, `codescope suggest <profile>`, `codescope prompt <text>`, direct profile names, `codescope --help`, and `codescope --version`.

Profile commands support repeatable `-a|--add <text>`, `-a=<text>`, and `--add=<text>`. They also support `--effort <value>`, `--effort=<value>`, `--model <value>`, `--model=<value>`, `--usage`, `--dry-run`, and `--debug-request`. Custom prompts support `--debug-request`.

Effort values are `none`, `low`, `medium`, `high`, `xhigh`, and `max`. Supported models are `gpt-6-astra`, `gpt-6-sol`, `gpt-6-luna`, `gpt-5.6-luna`, `gpt-5.6-terra`, and `gpt-5.6-sol`.

Put prompt additions before an optional `--`. After `--`, use only effort, model, or debug options. If prompt text starts with `-`, use `--`.

Supported platforms are Windows and Linux. The CLI uses the same command syntax on both platforms. CI checks Ubuntu only. CI does not check Windows. Validation evidence must distinguish direct checks from inferred compatibility.

Contributors run the global `eliware-test` validator. CI installs the latest npm, then runs `npm ci` and `npm test` on Ubuntu. Tests must check public inputs and visible workflow results.

Profile commands default to `gpt-6-luna`, its default reasoning effort, a live request, no usage report, and no added text. Finding reviews send effort `none` and summary `null`.

`--debug-request` prints the request to stderr before send. It prints the provider response after receipt. Finding reviews label these objects `--- REVIEW REQUEST ---` and `--- REVIEW RESPONSE ---`. Suggestions and custom prompts print one request and response. Logs can contain repository evidence.

Run `codescope` without a command to display help. Run `codescope all` for the full review.

Exit code mapping: successful commands exit with code `0`, even when a review has findings or a negative verdict. Usage errors exit with code `2`. Configuration errors exit with code `3`. Input errors exit with code `4`.

Provider request errors exit with code `5`. Invalid provider responses exit with code `6`. Other errors exit with code `4`. Request and transport timeouts exit with code `124`. SIGINT exits with code `130`. SIGTERM exits with code `143`.

CodeScope is read-only. It has no destructive review action.

## npm publication

The public package is `@eliware/codescope`. `package.json` is the source for its version. The repository is `https://github.com/eliware/codescope`.

Exact `package.json.files` allowlist: `src/`, `docs/`, `README.md`, `AGENTS.md`, `LICENSE`, `RELEASE_NOTES.md`, and `bin/`. The pack command is `eliware-test --pack`. Package checks must pass before publication.

`publishConfig.provenance` is `true`. The package uses npm Trusted Publishing with provenance. After publication, the authorized release operator verifies that the exact package version and release commit are visible at `https://registry.npmjs.org`.

Eli and the project developer run TagIt preflight together. Eli decides if the release is ready and instructs DevOps. DevOps executes the release through the Eliware Operations handoff.

This file and the npm-published profile do not authorize publication. Publication requires clear authorization through the Eliware Operations handoff.
