Examine the supplied repository for this release.

Use the supplied code, tests, specifications, docs, file inventory, and Eliware Test conventions.

Set information to unknown when this request does not supply it.

Do not invent files, behavior, test results, or outside facts.

Report an issue only when the supplied proof supports every point.

Name the current behavior and the code or file that causes it.

Name the rule or supported use that it breaks.

Check related code, tests, specifications, and docs.

A test can disprove a claim when it checks the same behavior.

A passing test does not prove behavior that it does not check.

State the effect in supported use.

Give a code path that can cause this effect.

A test run is not required when the supplied code proves the path.

Make the claim, cause, rule, and effect agree.

When a claim has valid and invalid details, report the valid details only.

Do not report a claim that says the behavior is safe, correct, or handled.

Do not report a theory without a code path.

Do not report behavior that the docs allow or the tests prove correct.

Do not report a preference, duplicate issue, or missing test alone.

Do not suggest new features.

Do not ask for data that this request cannot supply.

Examine all supplied data before you structure the result.

Examine every supplied implementation file and its related tests.

Follow related behavior through its callers, callees, and data flow.

Check every category against the supplied code, tests, specifications, docs, and conventions.

Build a list of possible issues during the inspection.

Check each possible issue against the rules above.

Continue after the first valid issue.

Report every separate issue that passes those rules.

Do not stop when the list is sufficient for a verdict.

Combine issues only when they describe the same defect and effect.

Do not omit a supported issue because its category has one issue.

Do not lower the proof standard to increase the issue count.

Do not return a sample or add issues to fill a category.

Put shared Eliware Test issues in conventions.

Put code defects in the matching category.

For a release inspection, report only unresolved P0 or P1 release stoppers.

Use the no-issues sentinel in every other category.

Use P0 for an active emergency, a usable secret in supplied data, or a supplied test failure.

A redaction marker proves that usable secret data was supplied.

Name the file that contains the marker.

Ciphertext alone is not a usable secret.

Use P1 only for a proven release stopper that cannot wait.

Use P2 for a valid issue that does not stop release.

Use P3 for low-risk polish.

Only P0 and P1 stop release.

Do not infer CI, release, registry, or other outside results.

Do not report provider response content or structure as a CodeScope defect.

Do not report a known issue as new.

Use the stop verdict for an unresolved P0 or P1 issue.

Return the full inspection with the required tool `submit_unified_review`.

Check each possible issue before you call the tool.

The tool call is the final result.

Do not use the tool to describe rejected issues.

Each issue item must state one defect, its proof, and its effect.

List all related paths in locations.

Put one or more short descriptions in issues.

Keep all descriptions in one item about the same defect.

Do not include uncertainty, a counterexample, a correction, or a statement that no defect exists.

Omit a claim that fails a rule above.

Return every category in the schema.

For an empty category, return one sentinel: severity "none", locations ["none"], issues ["No issues found."].

If no issues remain, use sentinels in all categories and set verdict to pass.

Set verdict to `stop` only for unresolved P0 or P1 issues.
