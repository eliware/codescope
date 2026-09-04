# Codescope progressive quick start

Codescope reviews the repository below your current working directory and writes one completed structured result from OpenAI. It does not edit files. Start narrow, fix the highest-value findings, and rerun the same profile before expanding the review.

The recommended project validation gates are `npm test`, `npm run lint`, and `npm run pack`.

## Owner workflow

1. Run `codescope all` exactly once at the beginning of this iteration (allow at least a 60-second timeout). Do not rerun it after making fixes; the goal harness owns subsequent iterations.
2. Fix every issue reported by that single CodeScope run.
3. Implement every practical suggestion reported by that single CodeScope run.
4. Run `npm test` and restore genuine 100×4 coverage.
5. For findings rejected by design:
   - First clarify the relevant documentation.
6. Every finding must receive an action:
   - Fix or implementation
   - Documentation update
7. Organize changes into separate, focused commits:
   - One commit per independent fix or tightly related group.
   - Include matching tests and documentation in the relevant commit.
   - Avoid combining unrelated fixes.
   - Avoid splitting trivial parts of one fix into unnecessary commits.
8. Validate each focused change when practical using the repository’s normal validation commands, but do not rerun `codescope all`.
9. Report every original issue and suggestion from the single CodeScope run with:
    - Final disposition
    - Relevant commit hash
    - Validation performed
10. Include all commit hashes and final validation results.
11. Only push and mark the goal complete when the final report for this iteration is pass with 0 issues and 0 suggestions. Do not rerun CodeScope to verify fixes; leave re-iteration to the goal harness.

## 1. Set up the token

Put the token in `~/.codescope`:

```text
OPENAI_API_TOKEN=sk-...
```

Or provide `OPENAI_API_TOKEN` in the process environment. The environment takes precedence over `~/.codescope`.

## 2. Establish an implementation baseline

From the repository root, run:

```text
codescope all
```

Fix P0 and P1 findings first. If lower-priority findings are not useful during the current pass, use the narrower profiles:

```text
codescope p0
codescope p0-1
codescope p0-2
codescope p0-3
```

These still send the complete implementation source, but ask the AI to include findings from P0 through the selected priority and omit lower priorities.

## 3. Improve structure and design

Run the structural profiles after the baseline is stable:

```text
codescope architecture
codescope api-design
codescope refactor
```

Each specialized profile focuses on its named category. Apply suggestions manually in small changes; Codescope does not edit files.

## 4. Strengthen tests

Use the test findings from the initial `all` review to guide implementation and test changes. Focused profiles constrain the review question, not the source files.

## 5. Check documentation

Review documentation findings from the initial `all` result and update the relevant usage, API, or behavior descriptions.

## 6. Run focused quality reviews

Use specialized profiles when you are ready to examine one concern:

```text
codescope architecture
codescope api-design
codescope cross-platform
codescope refactor
codescope security
codescope reliability
codescope performance
codescope dependencies
codescope observability
codescope accessibility
```

For product planning and small improvements:

```text
codescope suggest new-features
codescope quick-wins
codescope prioritize
```

`accessibility` is useful when the project has user-facing terminal or UI behavior.

The `cross-platform` profile evaluates portability within the host platforms and path semantics supported by the project; it does not emulate a foreign operating system.

## 7. Finish with a combined review

Use the initial `all` result as the combined baseline; subsequent iterations are owned by the goal harness.

This final pass includes package metadata, all `.js`, `.mjs`, `.cjs`, and `.ts` implementation files, all `.test.js`, `.test.cjs`, and `.test.mjs` test files, every `.md` file, and a names-only inventory of other repository files, then checks implementation, tests, and Markdown inconsistencies together. Git metadata, dependencies, root-level generated coverage output (`coverage/` and `.nyc_output/`), and coverage data are excluded; legitimate nested source directories such as `src/coverage/` are included. It reports findings across all of those categories in one result. Run it after the focused reviews, not as the first pass, so its output is easier to act on. Test evidence is inserted before the Markdown source in the combined input.

## 8. Review everything from every angle

```text
node C:\\Users\\russe\\src\\codescope\\bin\\codescope.mjs all
```

`all` sends implementation, test, and Markdown content in one request and
produces one consolidated JSON result containing both the review findings and
improvement suggestions. It requests exactly one review-tool call and one
suggestion-tool call in parallel, covering correctness, security, reliability,
performance, architecture, API design, cross-platform compatibility, test quality,
and documentation consistency.
The report groups findings under Correctness, Security, Reliability, Performance,
Architecture, API Design, Cross Platform, Tests, and Documentation, and shows a `No issues found.`
placeholder for empty categories.

## 9. Decide release readiness

```text
node C:\\Users\\russe\\src\\codescope\\bin\\codescope.mjs all
```

`all` is the comprehensive review and release-readiness gate. It reports every P0–P3 finding grouped by category, but returns `block` only for unresolved P0 or qualifying P1 issues. P2/P3 findings remain visible without blocking the verdict. A proven coverage-measurement or validation-integrity defect is P1 when it can make a passing result untrustworthy, even if the current test command passes. Missing source/test mirrors are P1 only when they leave required behavior or coverage unverified; pure barrels, generated files, configuration-only files, and explicitly excluded adapters are exempt.

## The review loop

For each profile:

1. Run the profile.
2. Fix the highest-priority real finding.
3. Add or update tests.
4. Rerun the same profile.
5. Continue until the result is stable, then move to the next profile.

If behavior is intentional, document the design decision near the affected code. The review may still report behavior that is not covered by the documented decision.

Use `--usage` after grouped or direct review/suggestion syntax when you want API usage metadata included; it is not a standalone command:

```text
codescope review architecture --usage
```

The `new-features` profile is suggestion-only. Both `codescope suggest new-features` and the shorthand `codescope new-features` request feature suggestions rather than issue findings.

Use `--dry-run` to count the prepared request through OpenAI's input-token endpoint without performing a review. This still requires `OPENAI_API_TOKEN` and incurs any applicable token-counting API charge:

```text
node C:\\Users\\russe\\src\\codescope\\bin\\codescope.mjs all --dry-run
```

Test-inclusive review profiles automatically run `npm test` in the target repository with a 30-second timeout and include its result after package metadata, implementation files, test files, and Markdown files. Use `--omit-test-results` to skip test execution or `--test-timeout 120` with a test-inclusive review command to override the timeout in seconds. Public suggestion profiles do not run tests; `--test-timeout` is accepted but has no effect for them, while `--omit-test-results` is rejected. Programmatic callers of `runReview` are responsible for keeping injected options such as `includesTests` consistent with their selected mode.
The CLI uses `~/.codescope`; the internal programmatic API can inject a different environment file, which is outside this workflow.
Use `--effort=none|low|medium|high|xhigh|max` to override the default reasoning effort (`none`).
Use `--model=gpt-5.6-luna|gpt-5.6-terra|gpt-5.6-sol` to override the default model.

The effort benchmark runs `none`, `low`, `medium`, and `high` in parallel. OpenAI and Codescope also support `xhigh` and `max`, but repository benchmark runs were slow and inconclusive, so both are excluded from the benchmark matrix. Use `npm run benchmark:efforts -- --model=gpt-5.6-terra` or `--model=gpt-5.6-sol` to benchmark another supported model; the selected model and its current rates are recorded in `summary.json`.

The current supported profiles are `architecture`, `api-design`, `cross-platform`, `refactor`,
`security`, `reliability`, `performance`, `dependencies`,
`observability`, `accessibility`, `quick-wins`, `prioritize`, `p0`, `p0-1`,
`p0-2`, `p0-3`, `new-features`, `release`, and `all`. Use `codescope review <profile>`
for issue review or `codescope suggest <profile>` for suggestions; direct
profile names are supported shorthand. `new-features` is suggestion-only.
