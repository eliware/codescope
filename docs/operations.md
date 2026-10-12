# Operations and data

## Review input

CodeScope uses the current working directory as the review root.
It selects files for the chosen profile.
It applies file and context size limits.
It does not follow symbolic links during repository discovery.
The file inventory can show files that CodeScope did not include.

The `all` profile includes code, tests, documentation, package data, and a file inventory.
Other profiles can use a smaller set of files.
CodeScope does not read files that fall outside the selected context.
Review requests include applicable Eliware Test conventions.

CodeScope does not run repository commands or tests.
It does not send test output to the provider.
Run tests through your own project tools.

## Provider request

Each review, suggestion, or custom prompt sends one request to OpenAI.
Help and version commands send no provider request.
CodeScope sends the selected repository context, prompt, and API token to the provider client.
It sends only `OPENAI_API_TOKEN` as a credential.

The provider can receive confidential source, tests, documentation, and configuration data.
Review and remove secrets before you run CodeScope.
Do not treat redaction or review as a complete secret control.

## Output

CodeScope writes the provider response to standard output.
If the provider returns a reasoning summary, CodeScope prints it first.
CodeScope does not parse the provider's result into a separate public response format.
It reports issues and verdict text as output only.

The `--usage` option adds token counts and cost.
The `--debug-request` option prints request and response data to standard error.
Debug data can contain repository content and provider output.
Store debug data as sensitive information.

## File changes

CodeScope reads the reviewed repository.
It writes only its command output.
It does not edit files in the reviewed repository.
It does not commit, push, release, publish, or deploy code.
