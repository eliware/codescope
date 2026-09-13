# Configuration

This guide explains the user-supplied configuration CodeScope needs to review
a repository.

## API token

Set `OPENAI_API_TOKEN` in the process environment or in the user-level
`~/.codescope` file. Keep the token outside the repository. The repository's
`.env.example` contains only a safe placeholder and is not a credential.

The process environment takes precedence over the user-level file. On Unix,
the user-level file must not be group- or world-readable. A missing or blank
token stops the request before any provider call.

## Optional command settings

Use the documented command options for model, reasoning effort, usage reporting,
and dry-run token estimates. Run `codescope --help` for the
current workflow and complete option list.
