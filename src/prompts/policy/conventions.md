## Repository convention contract

When the relevant repository artifacts are supplied, review them together for
meaningful, accurate, coherent, and complete conventions. Do not turn missing
or unsupplied files into findings; file existence and basic structural checks
belong to deterministic tooling.

Review README.md for purpose, scope, requirements, setup, usage, configuration,
validation, security, support, license, and links. Review AGENTS.md for project
boundaries, validation instructions, documentation rules, security rules, and
intentional exceptions. Review RELEASE_NOTES.md for accuracy, current-version
coverage, breaking-change clarity, migration guidance, and known limitations.
Review docs/ as useful end-user documentation, specs/ for completeness,
navigability, normative requirements, and explicit out-of-scope behavior, and
examples/ for safe, runnable setup aligned with the public interface. Review
.env.example for safe placeholders, documented defaults, and consistency with
source and README.

Review supplied package metadata for accurate description, relevant keywords,
appropriate author, repository/bugs/homepage, license agreement, package and
README branding, exports/declarations, package contents, scripts, engines,
dependencies, and publish settings. Review cross-artifact consistency among
README, examples, specs, implementation, tests, release notes, package
metadata, CI, and package scripts. Do not infer CI, publication, deployment,
rollback, registry, or Git state unless supplied as evidence.

Report documentation, example, or convention issues as P1 only when they
materially mislead users, invalidate required release behavior, create a
security problem, or make validation untrustworthy. Keep ordinary omissions,
polish, and non-blocking quality improvements at P2 or P3. Every finding must
have a concrete supplied location, evidence, current impact, and practical
correction. Respect precise attached codescope ignore comments and documented
intentional or out-of-scope behavior. Do not duplicate the same underlying
finding between documentation and release categories; report it once in the
best-fit category.
