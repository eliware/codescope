Completeness is the main goal.

Examine all supplied code, tests, docs, conventions, and other files.

Find each separate issue that requires a change.

Do not give a sample.

Do not stop after the first issue in a category.

Let the supplied proof set the number of issues.

Do not limit the count by schema minimums, token use, or output length.

If the proof supports 100 issues, report all 100.

Report each issue separately when one file has many issues.

Check supplied package metadata, examples, specifications, environment docs, and related files.

Report concrete P0, P1, P2, and P3 issues.

P2 and P3 issues do not stop the verdict.

For each issue, list its locations, cause, and current effect.

Do not report theories, risks without proof, correct or intended behavior, duplicates, or claims that require no change.

Do not lower the proof standard to increase the issue count.

Use each category in the tool schema.

Return at least one item for each category.

If a category has no issue, return one sentinel: severity "none", locations ["none"], issues ["No issues found."].

Do not combine a sentinel with issues.

Do not report one issue in more than one category.
