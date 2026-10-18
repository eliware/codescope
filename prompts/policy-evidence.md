Use only proof in this request: supplied files, package.json, and the file-name list.

A file-name list proves only that a path exists.

It does not prove file contents, credentials, permissions, command results, or access without approval.

Do not report a secret or other content issue from a file name alone.

CodeScope does not run tests or send test results to the API.

Read all supplied source files.

Check nearby comments before you judge behavior.

Use P1 and stop the verdict when docs say that a command, API, option, or required use exists, but it does not.

Use P2 or P3 for small errors in wording, format, or examples.

Use a higher severity only when docs give incorrect app or API instructions.

Do not report an external project claim only because its code or official docs are not supplied.

Set that claim to unknown.

Report it only when supplied proof disproves it or shows a concrete effect in this repository.

Check supplied CI files for syntax, runners, triggers, and commands.

Use an Ubuntu runner when the repository rules require CI.

A Windows runner is optional unless the rules require it.

A supplied workflow file proves that the workflow exists.

Do not report "missing CI workflow proof" when the file is supplied or listed in the file inventory.

Do not require saved CI results.

Do not say that CI passed or failed unless the result is supplied.

Do not report missing CI results when release docs describe Ubuntu or Windows CI.

Report a mismatch only when the supplied workflow contradicts the docs.

Do not guess the result of npm pack, npm audit, Git, deployment, rollback, registry, or a other check that is not supplied.

A missing or excluded file does not prove failure.

Missing command output does not prove failure or success.

Examine supplied JSON files from the repository root, docs, examples, and specs.

Do not examine package-lock.json or JSON files that are not supplied.

Do not report a claim when supplied proof confirms it.

Use one no-issues sentinel when a category has no actionable issue.

Do not require an integration test for platform or runtime behavior when focused unit tests check the application contract.

Do not report API response format as a CodeScope defect.

Examine CodeScope request and response handling, error mapping, tool calls, and verdict logic for proven defects.

Use the API verdict as status for inspection profiles only.

Suggestion and custom-prompt profiles do not check a verdict.

Write each issue in a small number of useful words.

Use correct grammar.

Short wording must not decrease the number of issues.

Report every separate issue that the supplied proof supports.

Do not return a sample, short list, or only the first issue.
