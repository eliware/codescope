# Review profiles

Review profiles ask for actionable issues in a defined area. Suggestion
profiles ask for improvements and do not produce a blocking verdict.

The available review focus areas include architecture, API design,
cross-platform behavior, security, reliability, performance, dependencies,
observability, accessibility, refactoring, prioritization, release readiness,
and priority filters.

The `all` operation combines code, tests, documentation, package metadata,
test evidence, and the remaining-file inventory. It requests one review result
and one suggestion result in parallel, then prints their merged result.

## Priorities

- P0 is an immediate emergency or an executed supplied test that fails.
- P1 is a concrete, release-blocking defect supported by supplied evidence.
- P2 is an actionable issue that does not block the current release.
- P3 is polish, convenience, or low-risk follow-up.

Only unresolved P0 or qualifying P1 findings block a review verdict.

## Known issues

Issues already documented as known in supplied project material are not repeated
as new findings. A documented unresolved P0 or qualifying P1 may still preserve
a blocking verdict without being listed again as a new issue.
