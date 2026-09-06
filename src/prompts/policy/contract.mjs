export const contractPolicy = `## Eliware release-contract rules

These are Convention v6.2 requirements when the repository is an Eliware
Node.js package and the relevant artifacts are supplied.

When the supplied repository content establishes a required project standard,
treat violations as release findings. Use only standards visible in the
supplied files and test output.

For maintained Node.js repositories, the normal required contract includes:

- Node.js 26, native ESM, and \`type: module\` where applicable;
- \`npm test\` and \`npm run lint\` scripts where the repository convention
  applies;
- exact local \`eliware-test\` commands for those scripts when the repository
  is a maintained Node.js project;
- committed formatter configuration plus \`format\` and \`format:check\`
  scripts;
- genuine 100×4 coverage for in-scope non-barrel production logic;
- no Istanbul ignore outside pure barrel/re-export files;
- focused tests corresponding to new or changed production modules;
- matching source/test structure where the repository uses the mirrored layout;
- focused modules and thin entrypoints;
- synchronized package metadata, exports, declarations, README, release notes,
  and lockfile when those files are supplied;
- exact public package author identity \`Eliware <eliware@eliware.org>\` for
  Eliware-owned packages, the \`@eliware\` scope, canonical repository links,
  and the Eliware Discord URL \`https://discord.gg/M6aTR9eTwN\` in public
  community/support links;
- no plaintext secrets, tokens, private keys, \`.env\` contents, or decrypted
  runtime state;
- safe argument-array process execution instead of shell quoting or unsafe
  pipelines;
- release workflows that publish only from authorized version tags when the
  workflow file is supplied;
- required validation commands represented consistently in package scripts,
  CI, and Knit configuration when those files are supplied.

Do not require CI, release, publication, deployment, audit, pack, rollback,
or historical validation results to be stored in the repository. CodeScope is
not agentic and cannot run those checks during review. A README claim
that a workflow or validation command exists may be checked against supplied
configuration, but missing execution evidence is not a defect unless the
actual result or failure is supplied in the request.

When the relevant artifacts are supplied, also enforce the complete v6.2
repository contract:

- \`docs/README.md\` indexes every direct end-user document in \`docs/\`, and
  \`docs/\` contains at least two complete end-user documents beyond its index;
- \`specs/README.md\` states specification scope and normative status, indexes
  every direct specification document, and links to explicit out-of-scope
  behavior;
- \`examples/README.md\` indexes runnable examples and documents prerequisites,
  commands, expected results, safe placeholders, and navigation;
- CI uses Node.js 26, runs on the required branch/PR/tag events, executes the
  required validation gates, uses least privilege, and separates publication
  from validation;
- Knit-managed repositories have \`.knit/deploy.yaml\` as the sole source of
  truth for target, working directory, and ordered commands;
- shared-stack capabilities use the applicable Eliware package, especially
  \`@eliware/common\` for logging, paths, errors, and lifecycle APIs;
- source and tests mirror one another exactly, every production module has a
  corresponding test, catch-all tests are avoided, entrypoints stay thin, and
  orchestrators do not absorb independent responsibilities;
- release documentation and supplied release-flow artifacts agree with the
  canonical release process.

A violation is P1 only when it affects required behavior, required validation,
security, release correctness, or makes a passing result untrustworthy.
Architecture preferences alone remain P2.

Required source/test structure is P1 only when a missing mirror leaves required
behavior or required coverage unverified. Pure barrels, generated files,
configuration-only files, and explicitly excluded adapters do not require a
one-to-one test file.

Do not downgrade a proven validation-integrity defect because the current test
command passes. A passing command does not prove that coverage or validation
measured the intended behavior.`;
