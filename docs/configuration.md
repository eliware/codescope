# Configuration

This guide explains the user-supplied configuration CodeScope needs to review
a repository.

## API token

Set `OPENAI_API_TOKEN` in the process environment or in the user-level
`~/.codescope` file. Keep the token outside the repository. The repository's
`.env.example` contains only a safe placeholder and is not a credential.

Only a nonblank `OPENAI_API_TOKEN` from the process environment takes
precedence over the user-level file. A missing or whitespace-only process
value is treated as absent, so a nonblank value from `~/.codescope` may be
used. On Unix,
the user-level file must not be group- or world-readable. A missing or blank
token stops the request before any provider call. On Windows, CodeScope requires
the parsed ACL SID list to contain only the current user SID. CodeScope uses
PowerShell's .NET security-descriptor API to obtain the DACL as SDDL and fails
closed if the machine-readable descriptor cannot be verified. On Unix, the file must remain present through the
permission check; disappearance after reading is rejected. CodeScope does not
reinspect a file solely because it appeared after the initial startup check.

## Optional command settings

Use the documented command options for model, reasoning effort, usage reporting,
and dry-run token estimates. Run `codescope --help` for the
current workflow and complete option list.
