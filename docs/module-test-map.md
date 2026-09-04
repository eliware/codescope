# Source and test architecture map

This map records the current one-to-one source/test hierarchy for the decomposition work. Each production module has a corresponding test module at the same relative path under `tests/`. Cross-module behavior remains covered at the lowest composition-level test.

| Source module | Mirrored test module |
| --- | --- |
| `src/benchmark-status.mjs` | `tests/benchmark-status.test.mjs` |
| `src/benchmark/status.mjs` | `tests/benchmark/status.test.mjs` |
| `src/cli-profiles.mjs` | `tests/cli-profiles.test.mjs` |
| `src/cli.mjs` | `tests/cli.test.mjs` |
| `src/cli/args.mjs` | `tests/cli/args.test.mjs` |
| `src/cli/errors.mjs` | `tests/cli/errors.test.mjs` |
| `src/cli/help.mjs` | `tests/cli/help.test.mjs` |
| `src/cli/main.mjs` | `tests/cli/main.test.mjs` |
| `src/cli/version.mjs` | `tests/cli/version.test.mjs` |
| `src/combine-all.mjs` | `tests/combine-all.test.mjs` |
| `src/combine-md.mjs` | `tests/combine-md.test.mjs` |
| `src/combine-mjs.mjs` | `tests/combine-mjs.test.mjs` |
| `src/combine/package-json.mjs` | `tests/combine/package-json.test.mjs` |
| `src/combine/section-format.mjs` | `tests/combine/section-format.test.mjs` |
| `src/find-md.mjs` | `tests/find-md.test.mjs` |
| `src/find-mjs.mjs` | `tests/find-mjs.test.mjs` |
| `src/find/entries.mjs` | `tests/find/entries.test.mjs` |
| `src/find/policies.mjs` | `tests/find/policies.test.mjs` |
| `src/pricing.mjs` | `tests/pricing.test.mjs` |
| `src/profiles/metadata.mjs` | `tests/profiles/metadata.test.mjs` |
| `src/profiles/prompt-routing.mjs` | `tests/profiles/prompt-routing.test.mjs` |
| `src/profiles/source-selection.mjs` | `tests/profiles/source-selection.test.mjs` |
| `src/prompt.mjs` | `tests/prompt.test.mjs` |
| `src/prompts/categories.mjs` | `tests/prompts/categories.test.mjs` |
| `src/prompts/tool-schemas.mjs` | `tests/prompts/tool-schemas.test.mjs` |
| `src/response/exact-keys.mjs` | `tests/response/exact-keys.test.mjs` |
| `src/response/review-response.mjs` | `tests/response/review-response.test.mjs` |
| `src/review-cleanup.mjs` | `tests/review-cleanup.test.mjs` |
| `src/review-config.mjs` | `tests/review-config.test.mjs` |
| `src/review-request.mjs` | `tests/review-request.test.mjs` |
| `src/review-response.mjs` | `tests/review-response.test.mjs` |
| `src/review.mjs` | `tests/review.test.mjs` |
| `src/review/test-results.mjs` | `tests/review/test-results.test.mjs` |

The flat modules and their tests are transitional adapters or orchestration boundaries. They remain listed so each future decomposition can move both sides together and update this map in the same focused commit.
