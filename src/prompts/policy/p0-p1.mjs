export const p0P1Policy = `## P0 — Emergency or failed test

Use P0 for an active or imminent emergency. Also use P0 for any supplied test
that ran and failed. This rule applies to required and optional tests.

- Active service outage affecting a required service.
- Confirmed or imminent irreversible data loss or corruption.
- Confirmed critical credential, secret, or private-key exposure.
- Supplied evidence contains a usable credential, token, password, private
  key, or other secret. This rule applies to source, docs, configuration, and
  test output.
- CodeScope has hidden a usable secret with a redaction marker. Treat the
  marker as proof. Report the file or output location.
- Do not report a label, placeholder, example, or text about secrets unless
  the evidence shows a usable secret.
- This secret rule overrides accepted-risk and intentional-behavior rules.
- Ciphertext or encrypted key data alone is not a usable secret. Report it
  only if the evidence also has the plain secret or a usable decryption key.
- A security defect that permits immediate unauthorized access or destructive control.
- A production action currently causing uncontrolled damage.
- Any test exclusion marker outside a pure barrel/re-export file.
P0 needs immediate action. It blocks every release.

Do not use P0 for theories, ordinary bugs, missing tests, old documentation,
or unused code. Use P0 for these only when a supplied test ran and failed.
test exclusion markers are permitted only in pure barrel/re-export files. When an
test exclusion marker appears elsewhere, report it as P0.

## P1 — Release blocker

Use P1 only when all these points are true:

1. Evidence proves the issue or lets another person repeat it.
2. The issue affects behavior required in this release.
3. It makes a required test, contract, check, or acceptance path fail or lack proof.
4. It can cause data loss, unsafe behavior, a security failure, wrong production behavior, or a misleading release.
5. The team cannot defer it and still make a safe release.
6. It has a specific location and a proven effect.

Use P1 for a validation defect that can make a passing result untrustworthy.
Examples include ignored coverage counts, wrong coverage calculations, mixed
or overwritten coverage files, and missing checks that allow a false pass.
Classify the defect as P1. Classify a missing regression test as P2, unless a
supplied test ran and failed.

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
- Old or concurrent validation files can mix with current results, cause a false pass, or change the result between runs.
- Required code has no test, so required behavior or the 100×4 gate lacks proof.

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
