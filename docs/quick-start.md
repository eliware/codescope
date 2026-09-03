# Codescope progressive quick start

Codescope reviews the repository below your current working directory and writes one completed structured result from OpenAI. It does not edit files. Start narrow, fix the highest-value findings, and rerun the same profile before expanding the review.

The recommended project validation gates are `npm test`, `npm run lint`, and `npm run pack`.

## Owner workflow

1. Run `codescope all`.
2. Fix every reported issue.
3. Implement every practical suggestion.
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
9. Validate each focused change when practical.
10. Report every original issue and suggestion with:
    - Final disposition
    - Relevant commit hash
    - Validation performed
11. Include all commit hashes and final validation results.

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

Use `architecture` for module boundaries, dependencies, data flow, scalability, reliability, and maintainability. Use `refactor` to identify monolithic files and responsibility splits. Apply suggestions manually in small changes; Codescope does not edit files.

## 4. Strengthen tests

```text
codescope all
```

Use `all` to review implementation behavior against the supplied tests and test results. Focused profiles constrain the review question, not the source files.

## 5. Check documentation

```text
codescope all
```

Review the Documentation category in the combined result for concrete inconsistencies, then verify that implementation and documentation describe the same behavior.

## 6. Run focused quality reviews

Use specialized profiles when you are ready to examine one concern:

```text
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

## 7. Finish with a combined review

```text
codescope all
```

This final pass includes package metadata, all `.js`, `.mjs`, `.cjs`, and `.ts` implementation files, all `.test.js`, `.test.cjs`, and `.test.mjs` test files, every `.md` file, and a names-only inventory of other repository files, then checks implementation, tests, and Markdown inconsistencies together. Git metadata, dependencies, coverage output, and coverage data are excluded. It reports findings across all of those categories in one result. Run it after the focused reviews, not as the first pass, so its output is easier to act on. Test evidence is inserted before the Markdown source in the combined input.

## 8. Review everything from every angle

```text
node C:\\Users\\russe\\src\\codescope\\bin\\codescope.mjs all
```

`all` sends implementation, test, and Markdown content in one request and
produces one consolidated JSON result containing both the review findings and
improvement suggestions. It requests exactly one review-tool call and one
suggestion-tool call in parallel, covering correctness, security, reliability,
performance, architecture, API design, test quality, and documentation consistency.
The report groups findings under Correctness, Security, Reliability, Performance,
Architecture, API Design, Tests, and Documentation, and shows a `No issues found.`
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

If behavior is intentional and should be excluded from every profile, add one nearby inline comment with the explicit marker and describe the complete scope. For example:

```js
// codescope ignore: bounded reads and serialized finite-limit reads keep memory predictable for large repositories.
```

Codescope supplies the behavior described after `codescope ignore:` to the AI as scoped review guidance. One comment can name multiple intentional behaviors; multiple comments on the same line are unnecessary. If a finding is only partly covered, Codescope explains why the residual behavior is outside the comment scope and suggests either fixing it or expanding the same comment to explicitly include it. Ordinary comments remain context and do not suppress findings; unrelated issues in the same code are still reported.

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

The current supported profiles are `architecture`, `api-design`, `refactor`,
`security`, `reliability`, `performance`, `dependencies`,
`observability`, `accessibility`, `quick-wins`, `prioritize`, `p0`, `p0-1`,
`p0-2`, `p0-3`, `new-features`, and `all`. Use `codescope review <profile>`
for issue review or `codescope suggest <profile>` for suggestions; direct
profile names are supported shorthand. `new-features` is suggestion-only.
