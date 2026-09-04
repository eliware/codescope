# Release readiness checklist

Use this checklist for the next release of `@eliware/codescope`. Do not run
`tagit push`, create a tag, publish, deploy, or modify GitOps until every
pre-push item is checked and the exact release version has been approved.

## 1. Scope and approval

- [ ] Confirm the release reason and intended user-visible outcome.
- [ ] Record the current package version from `package.json`.
- [ ] Propose one exact next version and classify it as patch, minor, or major.
- [ ] Summarize the changes, runtime impact, deployment impact, and known risks.
- [ ] Obtain Eli's explicit approval for that exact version before editing release notes, changing package metadata, tagging, publishing, or starting release automation.
- [ ] Stop and obtain new approval if the proposed version changes.

## 2. Repository ownership and state

- [ ] Read the repository `AGENTS.md`, README, project documentation, and this checklist.
- [ ] Confirm all changes belong to `eliware/codescope`; coordinate with another repository owner instead of editing their repository.
- [ ] Inspect `git status --short` and resolve every unexplained modification, untracked file, generated artifact, secret, runtime file, and benchmark output.
- [ ] Confirm the final source commit will be reproducible and all intended changes are committed in focused commits.
- [ ] Run `git diff --check` on the final pre-push state.

## 3. CodeScope review and implementation quality

- [ ] Run `codescope all` once on the final intended source state and record the complete issues, suggestions, verdict, and usage output.
- [ ] Fix every reported issue that is in scope.
- [ ] Implement every practical suggestion that belongs in this release.
- [ ] For intentional behavior, clarify the relevant documentation beside the affected code.
- [ ] Do not use ignores to hide defects, missing tests, coverage gaps, or unsupported release behavior.
- [ ] Confirm all P0/P1 findings are resolved and P2/P3 findings have an explicit disposition.
- [ ] Confirm no Istanbul ignore exists outside a pure barrel/re-export file.
- [ ] Confirm production modules remain cohesive, entrypoints remain thin, and focused tests mirror the responsibility structure.
- [ ] Confirm shared capabilities use the appropriate Eliware package, especially `@eliware/common` for logging, paths, errors, and lifecycle signals.

## 4. Tests and validation

- [ ] Run `npm ci` from a clean checkout or equivalent dependency state.
- [ ] Run focused tests for each changed behavior while iterating.
- [ ] Run `npm test` and confirm zero failures, zero warnings, and genuine 100×4 coverage for all in-scope non-barrel production logic.
- [ ] Confirm test failures, timeouts, incomplete results, and coverage failures are treated as release blockers.
- [ ] Run `npm run lint` and confirm zero errors and warnings.
- [ ] Run `npm run pack` and confirm the package dry-run succeeds.
- [ ] Run `npm audit --omit=dev --audit-level=moderate` and resolve or explicitly document any result.
- [ ] Run `npm run format:check` if formatting is part of the release validation; format only intentional source changes with `npm run format`.
- [ ] Run any additional project-owned smoke, contract, integration, or end-to-end checks required by the changed behavior.
- [ ] If local behavior needs runtime verification, test in a local container or lab environment and record which path was used.

## 5. Documentation and release metadata

- [ ] Review README purpose, installation, configuration, commands, profiles, examples, security, and validation instructions for accuracy.
- [ ] Review `docs/quick-start.md`, project documentation, and architecture documentation for drift.
- [ ] Ensure examples are runnable, contain no credentials, and contain no private machine paths.
- [ ] Update `RELEASE_NOTES.md` with the approved version and complete user-facing changes.
- [ ] Update `package.json` version, description, keywords, repository, homepage, bugs URL, exports, files list, scripts, engines, dependencies, and publish configuration as needed.
- [ ] Keep `package-lock.json`, exports, declarations, README, release notes, and package-file allowlists synchronized.
- [ ] Confirm the package version is not hard-coded inconsistently elsewhere.
- [ ] Update `docs/conventions/known_drifts.md` only if this repository has a current convention drift; otherwise verify its `codescope` entry remains accurate.

## 6. Workflow and Knit review

- [ ] Review every `.github` workflow for Node.js 26, current action versions, least-privilege permissions, and correct branch/tag triggers.
- [ ] Confirm validation runs `npm ci`, `npm test`, `npm run lint`, audit, and `npm pack --dry-run` on the supported operating systems.
- [ ] Confirm publication is a separate tag-only job that requires validation and grants `id-token: write` only to publication.
- [ ] Confirm branch pushes and pull requests cannot publish packages.
- [ ] Review `.knit/deploy.yaml` for explicit targets, working directories, ordered safe commands, and no secrets.
- [ ] Confirm Knit validation commands match the repository's required local and CI gates.
- [ ] Run the applicable Knit/configuration validation and record the result.
- [ ] Confirm no deployment, GitOps, or production operation is hidden in the generic application test command.

## 7. Release preparation before push

- [ ] Run `tagit notes` after approval and reconcile its change summary with the intended release notes.
- [ ] Review the complete diff from the previous tag, including source, tests, docs, metadata, workflows, lockfile, and package contents.
- [ ] Ensure each independent change is in a focused commit with matching tests and documentation.
- [ ] Confirm the final commit, approved version, release notes, package metadata, and validation evidence all agree.
- [ ] Record the final commit SHA, approved version, validation results, known warnings, and rollback/corrective plan.
- [ ] Confirm the worktree is clean and the only planned remote mutation is the authorized push.
- [ ] Obtain explicit authorization to push if it has not already been given.

## 8. Push and preflight handoff

- [ ] Run `tagit push` only after sections 1–7 are complete.
- [ ] Save the CI workflow URLs reported by `tagit push`.
- [ ] Run `tagit preflight` and wait for required CI and release checks.
- [ ] Confirm tests, coverage, lint, audit, package validation, exact commit identity, release metadata, and Knit checks pass.
- [ ] If preflight fails, fix the cause, commit the correction, push again, and rerun preflight; do not proceed while required checks fail.
- [ ] Hand DevOps the repository, exact approved version, source commit, release summary, preflight result, CI links, local validation, and known risks.

## 9. Publication and deployment boundaries

- [ ] DevOps verifies the requested version exactly matches the approved version before running `tagit release --version X.Y.Z`.
- [ ] DevOps runs `tagit release-wait` and records publication status, package version/tag, source commit, and registry visibility.
- [ ] If deployment is required, provide GitOps the published tag, immutable digest, source commit, and release evidence.
- [ ] Use the GitOps staging pull request for application-owned manifests, configuration, or secrets; do not edit protected GitOps `main` or operate Kubernetes directly.
- [ ] Have GitOps record sync, rollout, readiness, health, relevant events, and rollback/follow-up evidence.

## 10. Final record

- [ ] Record release version and tag, release/source SHAs, publication result, and digest when applicable.
- [ ] Record CI, preflight, tests, lint, audit, pack, Knit, and runtime validation results.
- [ ] Record release notes, warnings, follow-ups, rollback status, final timestamp, and AI usage/balance.
- [ ] Confirm the repository and all release records contain no secrets or decrypted runtime state.
