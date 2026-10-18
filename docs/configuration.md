# Configuration

## API token

Set `OPENAI_API_TOKEN` in the process environment or in `~/.codescope`.
Keep the token outside the repository.

CodeScope uses a nonblank process token first.
If that value is missing or blank, CodeScope reads `~/.codescope`.
CodeScope uses a nonblank `OPENAI_API_TOKEN` value from that file.
CodeScope sends only `OPENAI_API_TOKEN` to the provider client.

The token file must be a regular file, not a symbolic link.
CodeScope reads at most 100,000 bytes from that file.
Do not edit the file while CodeScope reads it.

The file can contain this line:

```text
OPENAI_API_TOKEN=your-token
```

The parser accepts optional `export`, comments, and quoted values.
It ignores unrelated lines.
It rejects malformed token assignments and malformed quoted values.

## Command values

Use `--model` to select a supported model.
Use `--effort` to set the reasoning level.
The default model is `gpt-6-luna`.
The default reasoning level is `none`.
Inspection requests ask for an automatic reasoning summary.

Online lookup is off by default. Add `--web-search` to enable it for one request.

Use `--usage` to report token counts and cost.
Use `--dry-run` to estimate input tokens and cost without an inspection request.

Read the [command guide](commands.md) for option syntax and supported values.
