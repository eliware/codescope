# Quick start

## Owner workflow

1. Run `codescope all` once. Review its issues and suggestions.
2. Fix each valid issue from that run.
3. Apply each useful suggestion from that run.
4. Run `npm test`. Restore genuine 100% statement, branch, function, and line coverage.
5. If an issue is invalid, clarify the relevant documentation first.
6. If documentation is not enough, add a narrow CodeScope ignore beside the code.
7. Do not use an ignore to hide a real defect.
8. Give each issue one action: fix, documentation change, or justified narrow ignore.
9. Use focused commits. Put each independent fix in its own commit.
10. Include matching tests and docs with each change.
11. Validate each focused change with the normal project commands.
12. Do not run `codescope all` again during the same iteration.
13. Report each original issue and suggestion, its final action, commit, and validation.
14. Report all commit hashes and final validation results.
15. Push and complete the goal only when the final report says pass, with no issues or suggestions.
16. Leave later iterations to the goal harness.

CodeScope does not run repository tests or include test results.
A provider response does not prove that the review found every issue.

## Profiles

Review profiles: `all`, `release`, `conventions`, `p0`, `p0-1`, `p0-2`, `p0-3`, `architecture`, `api-design`, `cross-platform`, `refactor`, `security`, `reliability`, `performance`, `dependencies`, `observability`, `accessibility`, `quick-wins`, and `prioritize`.

Suggestion profiles: `all`, `new-features`, `architecture`, `api-design`, `cross-platform`, `refactor`, `security`, `reliability`, `performance`, `dependencies`, `observability`, `accessibility`, `quick-wins`, and `prioritize`.
`codescope suggest all` makes one non-blocking pass across review categories and new features.

Run a profile with `codescope review <profile>` or `codescope suggest <profile>`.
Direct profile names are also supported.

## Options

The default model is `gpt-6-luna`.
Set effort with `--effort=none|low|medium|high|xhigh|max`.
Select a model with `--model=gpt-6-astra|gpt-6-sol|gpt-6.1-sol|gpt-6-luna|gpt-5.6-luna|gpt-5.6-terra|gpt-5.6-sol`.
Use `--usage` for provider token counts and calculated cost.
Use `--debug-request` to print request and response objects.
Use `--dry-run` to estimate token use without a provider call.

Issue reviews default to effort `none` and reasoning summary `auto`.
The `--effort` option selects the effort sent to the provider.
Debug output is raw and is not redacted. It can contain repository evidence or sensitive values returned by the provider. Protect these logs.

Issue reviews print request, event, and response data with `--debug-request`.
Suggestions and custom prompts print their single request and response.

## Custom prompts

Run `codescope prompt "your question"` to send a custom task.
CodeScope places the complete `all` context before your prompt as data.
Custom prompts use no review policy, output format, or tools.
CodeScope prints a provided reasoning summary before the provider response.
It writes the provider response unchanged after that summary.

Add guidance with `-a <text>`, `--add <text>`, `-a=<text>`, or `--add=<text>`.
For example, run `codescope prompt "your question" --add "Focus on changed files"`.

Put additions before an optional `--` delimiter.
If prompt text begins with `-`, put it before `--` and put trailing options after `--`.
For example, run `codescope prompt --summarize this -- --effort=low`.
After `--`, use only `--effort`, `--model`, or `--debug-request`.
