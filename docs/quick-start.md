# Codescope progressive quick start

Codescope reviews the repository below your current working directory and writes one completed structured result from OpenAI. It does not edit files. Start narrow, fix the highest-value findings, and rerun the same profile before expanding the review.

The project validation gates are `npm test`, `npm run lint`, and `npm run pack`.

## 1. Set up the token

Put the token in `~/.codescope`:

```text
OPENAI_API_TOKEN=sk-...
```

Or provide `OPENAI_API_TOKEN` in the process environment. The environment takes precedence over `~/.codescope`.

## 2. Establish an implementation baseline

From the repository root, run:

```text
codescope code
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
codescope tests
codescope code-tests
```

Use `tests` to review existing `*.test.mjs` files for missing or weak coverage. After adding or changing tests, use `code-tests` to check that implementation behavior and tests agree. The `code-tests-docs` profile includes every `.mjs` file, including tests, plus every `.md` file.

## 5. Check documentation

```text
codescope docs
codescope code-docs
```

Fix documentation inconsistencies first, then verify that the implementation and documentation describe the same behavior.

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
codescope code-tests-docs
```

This final pass includes every `.mjs` file and every `.md` file, then checks implementation, tests, and Markdown inconsistencies together. It does not report standalone code, test, or documentation issues. Run it after the focused reviews, not as the first pass, so its output is easier to act on.

## 8. Review everything from every angle

```text
codescope all
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
codescope all
```

`all` is the comprehensive review and release-readiness gate. It reports every P0–P3 finding grouped by category, but returns `block` only for unresolved P0/P1 issues, concrete documentation discrepancies, or major test gaps. P2/P3 findings remain visible without blocking the verdict.

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
codescope review code --usage
```

The `new-features` profile is suggestion-only. Both `codescope suggest new-features` and the shorthand `codescope new-features` request feature suggestions rather than issue findings.

Use `--dry-run` to count the prepared request through OpenAI's input-token endpoint without performing a review. This still requires `OPENAI_API_TOKEN` and incurs any applicable token-counting API charge:

```text
codescope all --dry-run
```

Profiles that include tests automatically run `npm test` in the target repository with a 30-second timeout and add the result after package metadata and test files, before documentation when documentation is included. Test-capable suggestions include `suggest code-tests`, `suggest tests`, and `suggest all`; these are examples, not an exhaustive list. Profiles without tests reject `--omit-test-results`. Use `--omit-test-results` to skip test execution or `--test-timeout 120` with a review or suggestion command to override the timeout in seconds.
The CLI uses `~/.codescope`; the internal programmatic API can inject a different environment file, which is outside this workflow.
Use `--effort=none|low|medium|high|xhigh|max` to override the default reasoning effort (`none`).
Use `--model=gpt-5.6-luna|gpt-5.6-terra|gpt-5.6-sol` to override the default model.

The effort benchmark runs `none`, `low`, `medium`, and `high` in parallel. OpenAI and Codescope also support `xhigh` and `max`, but repository benchmark runs were slow and inconclusive, so both are excluded from the benchmark matrix. Use `npm run benchmark:efforts -- --model=gpt-5.6-terra` or `--model=gpt-5.6-sol` to benchmark another supported model; the selected model and its current rates are recorded in `summary.json`.

The current supported profiles are `code`, `code-docs`, `code-tests`,
`code-tests-docs`, `tests`, `tests-docs`, `docs`, `architecture`, `api-design`,
`refactor`, `security`, `reliability`, `performance`, `dependencies`,
`observability`, `accessibility`, `quick-wins`, `prioritize`, `p0`, `p0-1`,
`p0-2`, `p0-3`, `new-features`, and `all`. Use `codescope review <profile>`
for issue review or `codescope suggest <profile>` for suggestions; direct
profile names are supported shorthand. `new-features` is suggestion-only.
