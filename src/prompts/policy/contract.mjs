export const contractPolicy = `## Eliware release-contract rules

When the supplied repository content establishes a required project standard,
treat violations as release findings. Use only standards visible in the
supplied files and test output.

For maintained Node.js repositories, the normal required contract includes:

- native ESM and \`type: module\` where applicable;
- \`npm test\` and \`npm run lint\` scripts where the repository convention
  applies;
- genuine 100×4 coverage for in-scope non-barrel production logic;
- no Istanbul ignore outside pure barrel/re-export files;
- focused tests corresponding to new or changed production modules;
- matching source/test structure where the repository uses the mirrored layout;
- focused modules and thin entrypoints;
- synchronized package metadata, exports, declarations, README, release notes,
  and lockfile when those files are supplied;
- no plaintext secrets, tokens, private keys, \`.env\` contents, or decrypted
  runtime state;
- safe argument-array process execution instead of shell quoting or unsafe
  pipelines;
- release workflows that publish only from authorized version tags when the
  workflow file is supplied;
- required validation commands represented consistently in package scripts,
  CI, and Knit configuration when those files are supplied.

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
