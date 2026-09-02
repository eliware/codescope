# Codescope progressive quick start

Codescope reviews the repository below your current working directory and writes one completed structured result from OpenAI. It does not edit files. Start narrow, fix the highest-value findings, and rerun the same profile before expanding the review.

The project validation gates are `npm test`, `npm run lint`, and `npm run pack`.
CI runs those checks, plus a high-severity npm audit, on Node.js 26 for both
Ubuntu and Windows.

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
codescope new-features
codescope quick-wins
codescope prioritize
```

`accessibility` is useful when the project has user-facing terminal or UI behavior.

## 7. Finish with a combined review

```text
codescope code-tests-docs
```

This final pass includes every `.mjs` file and every `.md` file, then checks implementation, tests, and Markdown together for conflicts. Run it after the focused reviews, not as the first pass, so its output is easier to act on.

## 8. Review everything from every angle

```text
codescope all
```

`all` sends implementation, test, and Markdown content in one request and
produces one consolidated review covering correctness, security, reliability,
performance, architecture, API design, test quality, and documentation consistency.
The report groups findings under Correctness, Security, Reliability, Performance,
Architecture, API Design, Tests, and Documentation, and shows `None` for empty
categories.

## 9. Decide release readiness

```text
codescope release
```

`release` is a release-readiness gate. It returns exactly one verdict: `pass` or `block`. It reviews P0/P1 correctness, security, reliability, user-data, API/contract, test/regression, and documentation risks. P2/P3, ignored, intentional, speculative, stylistic, and cosmetic findings do not delay release.

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

Codescope suppresses the behavior described after `codescope ignore:`. One comment can name multiple intentional behaviors; multiple comments on the same line are unnecessary. If a finding is only partly covered, Codescope explains why the residual behavior is outside the comment scope and suggests either fixing it or expanding the same comment to explicitly include it. Ordinary comments remain context and do not suppress findings; unrelated issues in the same code are still reported.

Use `--usage` after a review profile when you want API usage metadata included; it is not a standalone command:

```text
codescope code --usage
```
