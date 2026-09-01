# Codescope progressive quick start

Codescope reviews the repository below your current working directory and streams focused findings from OpenAI. Start narrow, fix the highest-value findings, and rerun the same profile before expanding the review.

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
codescope refactor
codescope architecture
```

Use `refactor` to identify monolithic files and responsibility splits. Use `architecture` for module boundaries, dependencies, data flow, scalability, reliability, and maintainability. Apply suggestions manually in small changes; Codescope does not edit files.

## 4. Strengthen tests

```text
codescope tests
codescope code-tests
```

Use `tests` to review existing `*.test.mjs` files for missing or weak coverage. After adding or changing tests, use `code-tests` to check that code behavior and tests agree.

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
codescope api-design
codescope release

```

`release` is a release-readiness gate. It returns one verdict: `pass`, `pass with known issues`, or `block release`. It blocks only for correctness, security, reliability, or user-data risks; stylistic and cosmetic findings do not delay release.

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

This final pass checks implementation, tests, and Markdown together for conflicts. Run it after the focused reviews, not as the first pass, so its output is easier to act on.

## The review loop

For each profile:

1. Run the profile.
2. Fix the highest-priority real finding.
3. Add or update tests.
4. Rerun the same profile.
5. Continue until the result is stable, then move to the next profile.

If behavior is intentional, add a nearby inline comment explaining why. For example:

```js
// Intentional: bounded reads keep memory predictable for large repositories.
```

Codescope is instructed to honor comments describing intentional policy and not report that behavior as a false positive.

Use `--usage` after a review profile when you want API usage metadata included; it is not a standalone command:

```text
codescope code --usage
```
