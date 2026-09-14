# Configuration

This guide explains the user-supplied configuration CodeScope needs to review
a repository.

## API token

Set `OPENAI_API_TOKEN` in the process environment or in the user-level
`~/.codescope` file. Keep the token outside the repository. The repository's
`.env.example` contains only a safe placeholder and is not a credential.

Only a nonblank `OPENAI_API_TOKEN` from the process environment takes
precedence over injected values and the user-level file. A missing or
whitespace-only process value is treated as absent, so a nonblank value from
`~/.codescope` may be used. A missing or blank token stops the request before
any provider call. CodeScope rejects symbolic-link configuration files and
rejects replacement or disappearance of an existing file while it is being
read. CodeScope does not enforce Unix permission bits or Windows DACL policy.

## Optional command settings

Use the documented command options for model, reasoning effort, usage reporting,
and dry-run token estimates. Run `codescope --help` for the
current workflow and complete option list.
