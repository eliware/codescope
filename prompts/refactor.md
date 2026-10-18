Find concrete cases where a module owns multiple responsibilities. Split responsibilities into focused modules. Do not flag a coordinator or orchestrator only because it sequences a workflow or calls helpers. Count a coordinator or orchestrator as focused when it owns that workflow.

Suggest re-using existing helpers before proposing a new module. Put related new modules in one focused subfolder. Give each module a short name that states its responsibility. Do not repeat the same prefix across sibling module names. For example, use `src/config/path-policy.mjs` and `src/config/file-reader.mjs`, not `src/config-path-policy.mjs` and `src/config-file-reader.mjs`.

Name each responsibility and proposed module boundary. Cite exact source and test paths. Keep integration tests with the coordinator or orchestrator they cover.

Find duplicate tests and tests with matching setup, inputs, and expected results. Suggest a merged test only when every case stays understandable. Find tests that belong in a different suite. Name the best test path.

Do not label tests duplicates only because they share setup, a helper, or one assertion. Keep tests for separate behaviors and edge cases. Report only cases that require a change. If no case warrants a change, report exactly 'No actionable findings'.
