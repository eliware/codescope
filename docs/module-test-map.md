# Source and test architecture map

This map records the current decomposition boundary. Executable modules under a responsibility directory have focused tests under the matching `tests/` directory. Composition tests may cover more than one module when the behavior is defined at that boundary. Public re-export barrels are intentionally covered through their underlying module or composition tests and do not require duplicate barrel tests.

| Responsibility | Production modules | Focused tests |
| --- | --- | --- |
| Benchmark | `src/benchmark/status.mjs` | `tests/benchmark/status.test.mjs` |
| CLI | `src/cli/*.mjs` | `tests/cli/*.test.mjs` |
| Combination | `src/combine/*.mjs` | `tests/combine/*.test.mjs` |
| Discovery | `src/find/*.mjs` | `tests/find/*.test.mjs` |
| Pricing | `src/pricing/*.mjs` | `tests/pricing/*.test.mjs` |
| Profiles | `src/profiles/*.mjs` | `tests/profiles/*.test.mjs` |
| Prompts | `src/prompts/*.mjs` | `tests/prompts/*.test.mjs` |
| Responses | `src/response/*.mjs` | `tests/response/*.test.mjs` |
| Review lifecycle | `src/review/*.mjs` | `tests/review/*.test.mjs` |

## Composition boundaries

- `src/prompt.mjs` is the public prompt assembly adapter; its integration contract is in `tests/prompts/index.test.mjs`.
- `src/cli.mjs`, `src/find-*.mjs`, `src/combine-*.mjs`, `src/review*.mjs`, and `src/pricing.mjs` are public re-export barrels. Their underlying responsibility modules and composition behavior are tested in the directories above.
- `src/prompts/policy.mjs` owns shared priority/evidence guidance and is covered by `tests/prompts/policy.test.mjs`.
- `tests/cli/commands.test.mjs` covers public CLI dispatch across the focused CLI modules.
- The former top-level catch-all prompt, CLI, and response-adapter tests have been relocated into the mirrored responsibility trees.

The production inventory is intentionally explicit through the responsibility-directory globs above; a new production module requires a matching focused test or an explicit pure-barrel exception documented here.

