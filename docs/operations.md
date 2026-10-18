# Operations and data

## Inspection input

CodeScope uses the current working directory as the inspection root.
It selects files for the chosen profile.
It applies file and context length limits.
It does not follow symbolic links during repository discovery.
The file inventory can show files that CodeScope did not include.

The `all` profile includes code, tests, documentation, package data, and a file inventory.
Other profiles can use a smaller set of files.
CodeScope does not read files that decrease outside the selected context.
Inspection requests include applicable Eliware Test conventions.

CodeScope does not run repository commands or tests.
It does not send test output to the provider.
Run tests through your own project tools.

## Provider request

Each inspection, suggestion, or custom prompt sends one request to OpenAI.
Help and version commands send no provider request.
CodeScope sends the selected repository context, prompt, and API token to the provider client.
It sends only `OPENAI_API_TOKEN` as a credential.

The provider can receive confidential source, tests, documentation, and configuration data.
Use redaction to remove secrets before you run CodeScope.
Redaction and inspection do not remove every secret.

## Web lookup

Inspection, suggestion, and custom prompt requests include OpenAI web lookup.
The model can select to lookup when it needs current public information.
A lookup query can use details from the request, with repository content and prompt text.
For example, a query can include an API name, package name, code information, or error message.
OpenAI processes the query and lookup results as item of the request.

Inspection request data before you run CodeScope. Do not send secrets or private data.

Each web lookup call adds a separate tool charge.
OpenAI bills lookup result tokens at the selected model's input token rates.
The `--usage` cost does not include the separate web lookup call charge.
See [OpenAI API pricing](https://developers.openai.com/api/docs/pricing) for current rates.

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
