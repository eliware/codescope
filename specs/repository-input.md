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

Test output is redacted deterministically before it is added to the provider
context. The redactor applies layered best-effort patterns covering named
credential assignments, authorization headers, query-string credentials,
common provider token formats, private keys, JWTs, public keys, long
hexadecimal values, and other long opaque values that resemble secrets. The
output is then length-limited. This pre-AI step is a data-minimization measure,
not proof that the context is secret-free.

The AI must perform a second, independent secret-exposure review over all
supplied context. It must report any visible or redacted credential, token,
password, private key, or other secret as P0. A redaction marker is evidence
that secret material was present even when the value itself is hidden. The
finding must identify the supplied file or output location and recommend
immediate credential rotation or revocation followed by removal from the
source or output.

Neither layer is a complete secret scanner or security boundary. Deterministic
redaction cannot guarantee removal of credentials with unknown names, novel
formats, unusual encoding, split output, or values resembling ordinary data;
AI detection can also miss or misclassify content. Repositories must not print
secrets during tests or rely on either layer to make secret-bearing output
safe. The repository owner remains responsible for sanitizing test output and
preventing credentials from entering the review context.
