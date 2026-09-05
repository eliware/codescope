export const p0P1Policy = `## P0 — Emergency or test-gate failure

Use P0 for an active or imminent severe incident, or any supplied test that
was executed and failed. Any supplied test that was executed and failed is a
release-blocking P0 regardless of whether the test is required or optional.

- Active service outage affecting a required service.
- Confirmed or imminent irreversible data loss or corruption.
- Confirmed critical credential, secret, or private-key exposure.
- Any supplied source, documentation, configuration, or test output that
  contains an actual credential, token, password, private key, or other usable
  secret is P0. This applies equally when the value is visible and when
  CodeScope has replaced it with a redaction marker: treat the redacted
  evidence as proof that secret material was present, and report the path or
  output location. Do not classify labels, placeholders, examples, or text
  that merely discusses secrets as exposure unless the supplied evidence shows
  usable secret material. This rule overrides accepted-risk and intentional-
  behavior exclusions.
  The recommended action must include immediate credential rotation or
  revocation, followed by removal from the supplied source or output.
- A security defect that permits immediate unauthorized access or destructive control.
- A production action currently causing uncontrolled damage.
- Any Istanbul ignore outside a pure barrel/re-export file.
P0 requires immediate action. It blocks all releases and may justify emergency intervention.

Do not use P0 for theoretical risks, ordinary bugs, missing tests, stale
documentation, or unused code unless the finding includes a concrete test
that was executed and failed. A concrete executed failing test is always P0.
Istanbul ignores are permitted only in pure barrel/re-export files. When an
Istanbul ignore appears elsewhere, report it as P0 and recommend removing the
ignore, adding focused tests, refactoring the implementation for testability,
or removing a truly unreachable or untestable branch.

## P1 — Release blocker

Use P1 only when every condition below is true:

1. The finding is reproducible or directly proven by concrete evidence.
2. It affects required behavior in the current release scope.
3. It causes a required test, contract, validation gate, or acceptance path to fail or remain unverified.
4. It could cause data loss, unsafe behavior, security failure, incorrect production operation, or a materially misleading release.
5. It cannot reasonably be deferred without making this release unsafe or incomplete.
6. The finding has a specific actionable correction.

Validation-integrity defects are qualifying P1 findings when they can make a
green result untrustworthy, even if the current test command exits successfully.
This includes ignored coverage counters, incorrect coverage derivation,
coverage artifacts that can be mixed or overwritten between runs, and missing
checks that permit a required validation result to report success incorrectly.
Treat the defect itself as P1; classify a missing regression test separately
as P2 unless that test failure is supplied and executed.

Examples:

- Documentation falsely claims a command, API, option, or required usage path exists when it does not.
- Required release validation cannot run for a reason other than a failing supplied test.
- Backup restore cannot be verified.
- Restore code can target production accidentally.
- Required cleanup fails after restore errors.
- Credentials or secrets can be exposed by the released path.
- A required API contract is broken.
- The package cannot build, install, start, or perform its declared core function.
- A mandatory release artifact is missing or generated from the wrong commit.
- A required production or deployment configuration is invalid.
- Coverage or validation logic can report a passing result while omitting required source lines, branches, functions, or statements.
- Concurrent or stale validation artifacts can contaminate a required result, produce a false pass, or make the result non-deterministic.
- Required source logic lacks a corresponding test and the omission leaves required behavior or the 100×4 gate unverified.

Do not use P1 for:

- Minor documentation wording, formatting, examples, or other discrepancies that do not misrepresent available commands, APIs, options, or required usage.
- Missing tests for optional or out-of-scope behavior.
- Broad coverage below an ideal target when required paths are tested.
- Refactoring opportunities.
- Duplicate logic.
- Unused parameters.
- Performance improvements without demonstrated release impact.
- Hypothetical future failures.
- Features explicitly deferred from the release.`;
