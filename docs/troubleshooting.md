# Troubleshooting

## Missing API token

Set `OPENAI_API_TOKEN` in the process environment or in `~/.codescope`.
Check that the process value is not blank.
CodeScope uses a nonblank process value before it reads the token file.
Run the command again.

## Invalid token file

Check that `~/.codescope` is a regular file, not a symbolic link.
Check that the file contains `OPENAI_API_TOKEN=value`.
Remove malformed quotes or token text.
Do not edit the file while CodeScope reads it.

## Unsupported model or reasoning level

Use a model from the installed `@eliware/openai` pricing catalog.
Use `none`, `low`, `medium`, `high`, `xhigh`, or `max` for `--effort`.
Read the [command guide](commands.md#options) for defaults and option syntax.

## Large repository context

CodeScope limits assembled repository context to 3,000,000 characters.
Use a focused profile to send less repository content.
Read [Operations and data](operations.md#repository-context) for file selection and limits.

## Provider or response error

Check your network connection and API token.
Read the error text that CodeScope prints.
Use `--debug-request` to inspect request and response data.
Limit access to debug output because it can contain repository content.

## Missing test results

CodeScope does not run repository tests.
Run your project test command before or after an inspection.
CodeScope does not send test results to OpenAI.

## Missing web results

Web lookup is off by default.
Add `--web-search` to enable web lookup for one request.
Web lookup does not guarantee a result for every request.

## Exit code

Read [Exit codes](commands.md#exit-codes) to identify the error type.
For support, use the [CodeScope issue tracker](https://github.com/eliware/codescope/issues).
