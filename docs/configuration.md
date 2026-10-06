# Configuration

This guide explains the configuration that CodeScope uses for reviews.

## API token

Set `OPENAI_API_TOKEN` in the process environment or in `~/.codescope`.
Keep the token outside the repository.

CodeScope uses a nonblank process token first.
It reads `~/.codescope` only when the process value is missing or blank.
It then uses a nonblank file value.
If neither value is available, CodeScope stops before a provider call.

The configuration path must point to a regular file, not a symbolic link.
CodeScope reads at most 100,000 bytes from the opened file.
It does not check whether the file changes during the read.
Do not edit `~/.codescope` while CodeScope reads it.
CodeScope does not enforce Unix permission bits or Windows DACL policy.

CodeScope reads only `OPENAI_API_TOKEN` from `~/.codescope`.
It ignores unrelated lines, including malformed lines.
Token values can use single or double quotes.
A trailing comment is allowed after whitespace.
Malformed token assignments and quoted values cause an error.

## Optional command settings

Use command options to set the model and reasoning effort.
Use `--usage` to report token counts and cost.
Use `--dry-run` to estimate token use.
Run `codescope --help` for the complete option list.
