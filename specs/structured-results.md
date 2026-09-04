# Structured results

Review requests use a required structured tool call. The result contains
category arrays, issue fields, a verdict, and any usage data requested by the
caller. Empty categories use the implementation's explicit no-issue item.

Suggestion requests use a corresponding required structured tool call with
category arrays and suggestion fields. `new-features` is included for the
suggestion set where the selected profile supports it.

The `all` operation expects exactly one review result and exactly one
suggestion result from the model, requested in parallel. The CLI validates both
results before merging them into the final JSON output.

Every reported issue or suggestion includes a location and a copy-paste-ready
ignore example when an ignore is appropriate. The model is instructed to use
only supplied evidence and to keep findings concise.
