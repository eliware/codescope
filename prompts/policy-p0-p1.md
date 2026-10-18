## P0 — Emergency or failed test

Use P0 for an active emergency or an imminent emergency.

Use P0 for a supplied test that ran and failed.

This rule applies to required and optional tests.

- An active outage affects a required application or system.

- Confirmed or imminent, irreversible data loss or corruption.

- A confirmed high-risk credential, secret, or private-key exposure.

- Supplied proof contains a usable credential, token, password, private key, or other secret.

- This rule applies to source, docs, configuration, and test output.

- CodeScope hides a usable secret with a redaction marker.

- Use the marker as proof.

- Name the file or output location.

- Do not report a label, placeholder, example, or text about secrets unless the proof shows a usable secret.

- This secret rule overrides accepted-risk and intentional-behavior rules.

- Ciphertext or encrypted key data alone is not a usable secret.

- Report it only when the proof also contains the plain secret or a usable decryption key.

- A defect permits urgent access or destructive control without approval.

- A production action causes uncontrolled damage.

- A test exclusion marker appears outside a pure barrel or re-export file.

P0 requires urgent action.

It blocks every release.

Do not use P0 for theories, ordinary bugs, missing tests, prior documentation, or unreferenced code.

Use P0 for those cases only when a supplied test ran and failed.

Test exclusion markers are permitted only in pure barrel or re-export files.

Report a test exclusion marker outside those files as P0.

## P1 — Release stopper

Use P1 only when all these points are true:

1. Proof shows the issue or lets a person repeat it.

2. The issue affects behavior required in this release.

3. It makes a required test, contract, check, or required path fail, or no proof exists.

4. It can cause data loss, unsafe behavior, access without approval, incorrect production behavior, or a misleading release.

5. The team cannot defer the issue and make a safe release.

6. The issue has an exact location and a proven effect.

Use P1 for a validation defect that can make a passing result untrustworthy.

Examples include ignored coverage counts, incorrect coverage calculations, mixed or overwritten coverage files, and missing checks that allow a false pass.

Classify this defect as P1.

Classify a missing regression test as P2, unless a supplied test ran and failed.

Examples:

- Docs falsely claim that a command, API, option, or required use exists when it does not.

- Required release validation cannot run for a cause other than a failed supplied test.

- Backup restore cannot be verified.

- Restore code can target production by mistake.

- Required cleanup fails after restore errors.

- The released path can expose credentials or secrets.

- A required API contract is broken.

- The package cannot build, install, start, or do its declared main function.

- A required release artifact is missing or uses the incorrect commit.

- A required production or deployment configuration is invalid.

- Coverage or validation logic can pass while it omits required source lines, branches, functions, or statements.

- Prior or concurrent validation files can combine with current results, cause a false pass, or change the result between runs.

- Required code has no test, so required behavior or the 100×4 gate lacks proof.

Do not use P1 for minor doc wording, formatting, examples, or other differences that do not misstate available commands, APIs, options, or required use.

Do not use P1 for missing tests for optional or out-of-scope behavior.

Do not use P1 for broad coverage less than an ideal target when required paths are tested.

Do not use P1 for refactoring, duplicate logic, unreferenced parameters, performance gains without a proven release effect, or hypothetical failures.

Do not use P1 for features that the release defers.
