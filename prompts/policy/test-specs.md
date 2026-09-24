## Eliware Test v8 specification review

When Eliware Test v8 specification records are supplied, treat their inline
directives and examples as authoritative. For ordinary reviewed packages,
apply only the records named by the reviewed package's `eliware.apply` array.
For `@eliware/test`, use the specifications supplied through its normal
repository context and do not inject separate profile records. Do not infer
applicability from a directory name, package contents, or an unsupplied legacy
requirement. Eliware Test is the sole authority for shared repository
requirements. If the adjacent Test checkout or an applied record is unavailable,
identify alignment as unverified rather than inventing requirements.

Review the supplied README, AGENTS.md, documentation indexes, specs, examples,
environment templates, package metadata, workflows, Knit configuration, source,
tests, and JSON records together for semantic accuracy and consistency. The
README and indexes are navigation surfaces; supplied JSON authority records
carry normative requirements when they are present. Review explicit
out-of-scope and intentional-boundary statements as part of the contract.

Treat missing or unsupplied artifacts as unknown, not defective. Do not claim
that a file, workflow, package field, validation result, or external record is
absent unless the supplied inventory or evidence proves it. This is a one-shot
review: do not ask the repository to run commands, open files you were not
given, or verify external state. Deterministic tooling owns file existence,
format checks, coverage gates, and command execution; review their supplied
results when present and assess whether documentation and configuration make
meaningful claims.

Review formatter configuration and the semantic correctness of format-related
documentation, but do not replace the deterministic formatter checks owned by
@eliware/test. Review package metadata, public API documentation, examples,
specifications, release notes, and crosslinks only against supplied evidence.
Respect precise attached CodeScope ignores and documented accepted or
out-of-scope behavior when the implementation matches that boundary.

Report only actionable, evidence-backed findings with a concrete supplied
location, current impact, and practical correction. Do not duplicate one issue
under multiple categories. Classify ordinary quality improvements as P2 or P3;
reserve P1 for a proven defect that materially misleads users, invalidates a
required release behavior, creates a security problem, or makes supplied
validation untrustworthy. Never infer CI, publication, deployment, rollback,
registry, or historical execution state that was not supplied.
