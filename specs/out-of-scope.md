# Explicitly out of scope

The following behavior is intentionally outside CodeScope's normal review
contract unless the caller supplies direct evidence for it:

- CI status, deployment state, registry state, Git status, rollback evidence,
  `npm pack`, `npm audit`, or other commands whose output was not supplied.
- Files excluded by the selected profile or absent from the supplied context.
- JSON, YAML, TOML, lockfiles, fixtures, schemas, assets, and generated files
  when their contents were not included.
- Symbolic links and their targets.
- Coverage artifacts and root generated coverage output.
- Provider internals, operating-system behavior, and delegated child-process
  mechanics when the application contract is covered by focused injected tests.
- New feature proposals in review profiles.
- Repository modification, automatic fixes, commits, pushes, releases,
  publication, and deployment.

These boundaries describe what CodeScope can conclude from its input; they do
not assert that the excluded systems are healthy.
