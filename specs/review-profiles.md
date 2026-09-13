# Review profiles

Review profiles ask for actionable issues in a defined area. Suggestion
profiles ask for improvements and do not produce a blocking verdict.

The available review focus areas include architecture, API design,
cross-platform behavior, security, reliability, performance, dependencies,
observability, accessibility, refactoring, prioritization, release readiness,
and priority filters.

The `all` operation combines code, tests, documentation, package metadata,
the remaining-file inventory. It requests one review result
and one unified review result covering implementation, tests, and Markdown context.

The `conventions` profile reviews supplied repository documentation, package
metadata, specifications, environment documentation, and
cross-artifact consistency for semantic quality. It does not replace
deterministic file-existence, structural, test, or publication checks owned by
`@eliware/test` and TagIt. The `all` and `release` profiles include this
convention contract alongside their broader review. Missing or unsupplied
artifacts are unknown rather than defects.

## Priorities

- P0 is an immediate emergency or an executed supplied test that fails.
- P1 is a concrete, high-priority defect supported by supplied evidence.
- P2 is an actionable issue that does not block the current release.
- P3 is polish, convenience, or low-risk follow-up.

Unresolved P0/P1 findings should produce a `block` verdict in the provider
report. That verdict is provider output only and never changes the CLI exit
code.

## Known issues

Issues already documented as known in supplied project material are not repeated
as new findings. A documented unresolved P0 or qualifying P1 may still preserve
a blocking verdict without being listed again as a new issue.

Explicitly documented intentional behavior, accepted risks, supported
limitations, and out-of-scope capabilities are omitted when implementation
matches the documented boundary. They are not reported as informational or
acknowledged findings. They may be reported only when implementation
contradicts the documentation or concrete evidence shows impact outside the
accepted boundary.
