# Operations and data

## Repository context

CodeScope uses the current working directory as the repository root.
It selects files for the command and profile.
The `all`, `release`, `conventions`, and `refactor` commands use code, tests, documentation, package data, and file inventory.
Other profiles can use a smaller set of files.

The `all` context can include package data, JSON, YAML, configuration, Markdown, source files, and tests.
CodeScope excludes `package-lock.json` contents from the supplied context.
The inventory lists each lockfile by name and metadata.
The inventory lists other files by name and metadata.
Text entries include line and byte counts.

Binary files show their byte count.
Large files show the sampled-byte limit message.

It does not include the content of files that appear only in the inventory.
The inventory can be truncated when the context limit is reached.

CodeScope skips symbolic links during file discovery.
It skips `.git` and `node_modules` directories at every depth.
It skips root `coverage` and `.nyc_output` directories.
CodeScope rejects assembled context above 3,000,000 characters.
CodeScope reads no more than 100,000 bytes and 200 lines from each configuration file.

For other repositories, CodeScope reads applicable semantic convention files from an adjacent `eliware/test` checkout.
It selects convention profiles from `package.json` field `eliware.apply`.
It does not include deterministic convention files.
It reports when the checkout or a required convention file is unavailable.

CodeScope does not run repository commands or tests.
It does not send test results to OpenAI.
Run tests with your project tools before you request an inspection.

## Provider requests

Each live inspection, suggestion, or custom prompt sends one model request to OpenAI.
A dry run sends one input-token count request.
Help and version commands send no request.
CodeScope sends the selected repository context, prompt, and API token to OpenAI.
It sends only `OPENAI_API_TOKEN` as a credential.

The provider can receive source files, tests, documentation, configuration, and prompts.
Remove secrets and private data before you run CodeScope.
CodeScope cannot remove every secret from the selected content.

## Web lookup

Web lookup is off by default.
Add `--web-search` to enable it for one inspection, suggestion, or custom prompt.
The model can then request current public information.
A lookup query can use request details, such as repository content and prompt text.
OpenAI processes the query and lookup results as part of the request.

Web lookup can add a separate tool charge.
OpenAI can also charge for lookup result tokens at the selected model's input rate.
The `--usage` cost does not include the separate lookup charge.
Read [OpenAI API pricing](https://developers.openai.com/api/docs/pricing) for current rates.

## Output and usage

CodeScope writes the provider response to standard output.
It prints a reasoning summary first when the provider returns one.
It does not convert the provider response to a separate public result format.
Reported issues and verdicts do not change the command exit code.

The `--usage` option adds provider token counts and calculated cost after a live request.
If the provider omits usage data, CodeScope reports that the data is unavailable.
The `--dry-run` option sends an input-token count request, not a model response request.
The dry run can estimate cost when you also use `--usage`.

The `--debug-request` option writes request and response data to standard error.
Debug data can contain repository content and provider output.
Limit access to debug data.

## File changes

CodeScope reads the selected repository content.
It writes command output only.
It does not edit, commit, push, publish, or deploy repository files.
