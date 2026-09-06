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

Do not report missing stored CI or release-result evidence. Repositories are
not required to commit historical workflow results. Review supplied workflow
configuration and documentation claims for consistency, but require an actual
supplied command result before reporting a failed or unverified validation
execution.

When supplied, enforce these v6 structural requirements rather than merely
noting them: the direct-document indexes and minimum end-user document counts
under `docs/`; normative scope, complete links, and explicit out-of-scope
behavior under `specs/`; runnable prerequisites, commands, expected results,
and safe placeholders under `examples/`; Node.js 26 and exact local
`eliware-test` scripts; CI event, runtime, validation, permission, and
publication separation; `.knit/deploy.yaml` as the sole Knit command source;
shared-stack usage, including `@eliware/common` for logging, paths, errors,
and lifecycle APIs; and exact mirrored source/test architecture with thin
entrypoints, focused modules, and no catch-all tests. Review supplied release
documentation against the canonical release-flow material rather than
inventing release state.

Report documentation, example, or convention issues as P1 only when they
materially mislead users, invalidate required release behavior, create a
security problem, or make validation untrustworthy. Keep ordinary omissions,
polish, and non-blocking quality improvements at P2 or P3. Every finding must
have a concrete supplied location, evidence, current impact, and practical
correction. Respect precise attached codescope ignore comments and documented
intentional or out-of-scope behavior. Do not duplicate the same underlying
finding between documentation and release categories; report it once in the
best-fit category.
