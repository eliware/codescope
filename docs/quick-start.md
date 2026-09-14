## Owner workflow

1. Run `codescope all` exactly once at the beginning of this iteration. CodeScope never runs repository tests or includes test execution results. Do not rerun it after making fixes; the goal harness owns subsequent iterations.
2. Fix every issue reported by that single CodeScope run.
3. Implement every practical suggestion reported by that single CodeScope run.
4. Run `npm test` and restore genuine 100×4 coverage.
5. For findings rejected by design:
   - First clarify the relevant documentation.
   - If documentation alone is insufficient, add a narrowly scoped CodeScope ignore beside the affected code.
   - Never use ignores to hide real defects.
6. If a finding appears already ignored or documented as out of scope, treat that as insufficiently explicit. Strengthen the documentation or add a scoped ignore at the specific code location.
7. Every finding must receive an action:
   - Fix or implementation
   - Documentation update
   - Narrowly scoped ignore with justification
8. Organize changes into separate, focused commits:
   - One commit per independent fix or tightly related group.
   - Include matching tests and documentation in the relevant commit.
   - Avoid combining unrelated fixes.
   - Avoid splitting trivial parts of one fix into unnecessary commits.
9. Validate each focused change when practical using the repository’s normal validation commands, but do not rerun `codescope all`.
10. Report every original issue and suggestion from the single CodeScope run with:
    - Final disposition
    - Relevant commit hash
    - Validation performed
11. Include all commit hashes and final validation results.
12. Only push and mark the goal complete when the final report for this iteration is pass with 0 issues and 0 suggestions. Do not rerun CodeScope to verify fixes; leave re-iteration to the goal harness.

## Available profiles

Review: `all`, `release`, `conventions`, `p0`, `p0-1`, `p0-2`, `p0-3`, `architecture`, `api-design`, `cross-platform`, `refactor`, `security`, `reliability`, `performance`, `dependencies`, `observability`, `accessibility`, `quick-wins`, `prioritize`.

Suggestions: `all`, `new-features`, `architecture`, `api-design`, `cross-platform`, `refactor`, `security`, `reliability`, `performance`, `dependencies`, `observability`, `accessibility`, `quick-wins`, `prioritize`. `suggest all` is one non-blocking generic suggestion pass across every review category plus `new-features`.

Run profiles with `codescope review <profile>` or `codescope suggest <profile>`. Direct profile names are supported shorthand. Use `--effort=none|low|medium|high|xhigh|max`, `--model=gpt-5.6-luna|gpt-5.6-terra|gpt-5.6-sol`, and `--usage` when needed.

Custom prompt: `codescope prompt "your question"` sends the complete `all` context without tools and returns the provider response unchanged. Use `--` to end prompt text before supported trailing options if the prompt begins with `-`; only valid options may follow the delimiter.
