# Validation and Release Ownership Boundaries

## `@eliware/test` — deterministic repository validation

`@eliware/test` owns repeatable checks with objective pass/fail results:

- Tests and 100×4 coverage.
- Lint, warnings, typechecking, build, audit, package, and configured smoke,
  integration, regression, and E2E scripts.
- Source/test mapping, monolith limits, ignore-policy enforcement, required
  repository files, and directory structure.
- README, docs, specs, examples, `.env.example`, package metadata, branding,
  links, badges, license, published-file, and package-layout validation.
- Deterministic release and convention rules from the current policy.

`npm test` is the authoritative deterministic validation command. It must not
rely on AI judgment or subjective interpretation.

## `@eliware/codescope` — semantic review

CodeScope reviews the same repository contract semantically. It evaluates
documentation quality and coherence, meaningful test coverage, architecture,
APIs, security, reliability, performance, portability, conventions, waivers,
known drift, and release-readiness risks that require judgment.

CodeScope does not run or consume repository test output. It reviews supplied
repository evidence only; repository owners and CI own test execution. Its
output distinguishes confirmed findings, AI judgments, unverified areas, and
release advice.

CodeScope is read-only and advisory. It does not modify files, commit, push,
publish, or release.

## `@eliware/tagit` — release orchestration

TagIt owns release workflow state and publication verification. It verifies the
approved harness, checks version,
tag, branch, worktree, CI, publication, release-artifact, and permission state,
and performs explicitly authorized push, tag, and publication operations.

TagIt must not duplicate tests, coverage, lint, typechecking, audit, package,
build, monolith, documentation, metadata, or convention checks owned by
`@eliware/test`. It may verify release-specific identity, but not general
metadata compliance.

## Boundary rule

```text
@eliware/test      deterministic validation
@eliware/codescope semantic quality and risk review
@eliware/tagit     validation invocation, release state, and publication
```

CodeScope documentation should identify deterministic repository and convention
checks as `@eliware/test` responsibilities. TagIt invokes that validation and
owns release-state, CI, publication, and orchestration checks.
