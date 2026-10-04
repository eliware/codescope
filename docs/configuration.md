# Configuration

This guide explains the user-supplied configuration CodeScope needs to review
a repository.

## API token

Set `OPENAI_API_TOKEN` in the process environment or in the user-level
`~/.codescope` file. Keep the token outside the repository.

CodeScope uses a nonblank `OPENAI_API_TOKEN` from the process environment
directly and reads `~/.codescope` only when the process value is missing or
whitespace-only. A nonblank file value is then used. A missing or blank token stops the request before
any provider call. CodeScope checks that the configuration path is a regular,
non-symbolic-link file before opening it, then reads at most 100,000 bytes from
the opened handle. It does not check file identity or content stability after
opening, so replacement or edits during the read are not detected. Do not edit
`~/.codescope` while CodeScope is reading it.
CodeScope does not enforce Unix permission bits or Windows DACL policy.

Only `OPENAI_API_TOKEN` is interpreted from `~/.codescope`. Unrelated lines,
including malformed ones, are ignored. Token values may be single- or
double-quoted, with a trailing comment after whitespace; malformed token
assignments or quoted values are rejected.

## Optional command settings

Use the documented command options for model, reasoning effort, usage reporting,
and dry-run token estimates. Run `codescope --help` for the
current workflow and complete option list.
