# Configuration

## API token

Set `OPENAI_API_TOKEN` in the process environment or in `~/.codescope`.
Keep the token outside the repository.

CodeScope uses a nonblank process value first.
If that value is blank or missing, CodeScope reads the token file.
On Windows, the token file path is `%USERPROFILE%\.codescope`.

The token file must contain an `OPENAI_API_TOKEN` assignment.

```text
OPENAI_API_TOKEN=your-token
```

The parser accepts optional `export`, comments, and quoted values.
It ignores unrelated lines.
It rejects malformed token assignments and malformed quoted values.

The token file must be a regular file, not a symbolic link.
CodeScope reads at most 100,000 bytes from that file.
Do not edit the file while CodeScope reads it.
CodeScope sends only `OPENAI_API_TOKEN` as a credential.

## Command values

Use `--model` to select a model from the installed `@eliware/openai` pricing catalog.
Use `--effort` to set the reasoning level.
The default model is `gpt-6-luna`.
The default reasoning level is `none`.
Inspection requests ask for an automatic reasoning summary.

Web lookup is off by default.
Add `--web-search` to enable it for one request.

Use `--usage` to report token counts and calculated cost after a live request.
Use `--dry-run` to count input tokens without requesting a model response.
The dry run sends a token-count request to OpenAI.

Read the [command guide](commands.md) for option syntax and supported values.
