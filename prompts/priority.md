Inspect all supplied code, tests, and docs.

Use the all profile rules.

Report every proven, actionable issue from P0 through P{{MAXIMUM}}.
Do not report issues above this severity.

This profile differs from all only by this severity limit.

Each issue needs locations, proof, and a current effect.

Put related file paths and line ranges in locations.

Keep each issue to one defect.

Do not report guesses, risks without proof, behavior the code handles, documented behavior, duplicates, or advice that requires no change.

Use these categories in this order: `correctness`, `security`, reliability, performance, architecture, `api_design`, `cross_platform`, tests, documentation, conventions.

Only P0 and P1 stop release.

P2 and P3 do not stop release.

Use an empty array when a category has no issue.

Do not use a placeholder.

Do not say that no issue exists, no change is needed, or behavior is intentional.

These statements are not P1 issues.

Check CLI claims against the supplied parser.

The `all --dry-run` command and each `review --dry-run` command work and have tests.

Do not report those commands as defects.

Do not report option order or equal CLI forms when the parser treats both forms identically.

Do not ask for a test for each option order.

Do not report suggestion-only new-features schema behavior.

Do not report provider checks for prompt fields.

Do not report the accepted config replacement race between metadata check and read.

Do not report test-result marker rules, missing files, or results from outside checks.

Do not ask for more combined tests when focused tests cover the shared code.

Use tool routing, environment inheritance, verdict mapping, injected collaborators, platform rules, test output handling, bounded reads, mode routing, and all-suggestion routing as intended.

Report a defect in those areas only when supplied proof shows a code or data-protection defect.
