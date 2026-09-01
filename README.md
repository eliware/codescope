# codescope

`codescope` is a Node.js command-line tool for inspecting codebases. The initial scaffold provides a stable CLI contract ready for project-specific analysis commands.

## Requirements

- Node.js 26 or newer
- npm

## Setup

```text
npm install
```

Run the CLI locally:

```text
node bin/codescope.mjs --help
node bin/codescope.mjs --version
```

## Validation

```text
npm test
npm run lint
npm run pack
```

The tool currently performs no external connections and requires no configuration or secrets. It exits with code `0` for supported commands and `2` for invalid input. No deployment or runtime service is defined yet.

## Security and operations

Do not place credentials, tokens, `.env` files, or runtime state in the repository. Future commands that modify files should validate inputs and provide dry-run and confirmation controls.
