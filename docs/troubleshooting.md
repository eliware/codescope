# Troubleshooting

## Missing API token

Set `OPENAI_API_TOKEN` in the process environment or in `~/.codescope`.
Run the command again.
Keep the token outside the repository.

## Invalid token file

Check that `~/.codescope` is a regular file.
Check that its token line uses `OPENAI_API_TOKEN=value`.
Remove malformed quotes or token text.
Do not edit the file while CodeScope reads it.

## Unsupported model or effort

Use a supported model from the [command guide](commands.md#options).
Set effort to `none`, `low`, `medium`, `high`, `xhigh`, or `max`.

## Provider or response error

Check your network connection and API token.
Check the error details that CodeScope prints.
Use `--debug-request` to inspect request and response data.
Protect debug output because it can contain repository content.

## Test results are missing

CodeScope does not run repository tests.
Run the repository's test command before or after a review.
CodeScope does not send test output to OpenAI.

## Exit code

Read [Exit codes](commands.md#exit-codes) to find the error type.
For support, use the [CodeScope issue tracker](https://github.com/eliware/codescope/issues).
