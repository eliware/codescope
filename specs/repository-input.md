# Repository input

## Ordering

The comprehensive context is assembled in this order:

1. `package.json`
2. Root, `docs/`, and `specs/` JSON files, excluding
   `package-lock.json`
3. `.github` and `.knit` text configuration files, with each file limited to 200 lines
4. Markdown files
5. Implementation files
6. Test files
7. A names-only inventory of remaining files, including text line/byte counts and binary byte counts

Files already included in an earlier section are omitted from the final
inventory.

## Included source

Implementation discovery includes `.js`, `.mjs`, `.cjs`, and `.ts` files.
Test discovery includes `.test.js`, `.test.cjs`, and `.test.mjs` files.
Markdown discovery includes `.md` files. JSON context includes only JSON files
in the repository root, `docs/`, and `specs/`; `package-lock.json`
and JSON elsewhere remain inventory-only.
Convention JSON is read from a checkout at ../conventions/specs relative to
the reviewed repository. The conventions package.json and package-lock.json
are never included. If that checkout is not supplied, CodeScope reports that
convention evidence was unavailable rather than pretending to enforce it.

Root generated coverage directories, dependency directories, Git metadata, and
coverage data are excluded. Legitimate nested source directories such as
`src/coverage/` remain eligible. Symbolic links, whether files or directories,
are skipped and never followed.

## Test execution

CodeScope never runs tests in the reviewed repository and never includes test
execution output in provider context. Repository owners and deterministic
validation tooling own test execution separately.

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
