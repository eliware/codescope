# Repository input

## Ordering

The comprehensive context is assembled in this order:

1. `package.json`
2. `.github` and `.knit` text configuration files, with each file limited to 200 lines
3. Markdown files
4. Implementation files
5. Test files
6. Test execution results when the selected profile includes tests
7. A names-only inventory of remaining files, including text line/byte counts and binary byte counts

Files already included in an earlier section are omitted from the final
inventory.

## Included source

Implementation discovery includes `.js`, `.mjs`, `.cjs`, and `.ts` files.
Test discovery includes `.test.js`, `.test.cjs`, and `.test.mjs` files.
Markdown discovery includes `.md` files.

Root generated coverage directories, dependency directories, Git metadata, and
coverage data are excluded. Legitimate nested source directories such as
`src/coverage/` remain eligible. Symbolic links, whether files or directories,
are skipped and never followed.

## Test evidence

Test-inclusive review profiles run `npm test` with a 30-second default timeout.
Partial output is retained when the process times out. A custom timeout can be
provided, or test execution can be omitted explicitly.
