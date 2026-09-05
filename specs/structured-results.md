# Structured results

Review requests ask the provider for JSON as a transport format only. CodeScope
pretty-prints valid JSON but does not expose or enforce a stable programmatic
response schema. JSON output may be malformed or have any shape; downstream AI
agents can still read and use the raw or best-effort-formatted response. The
only field used for process status is `verdict`: `pass` exits successfully and
every other or missing verdict is treated as blocked.

This transport-only contract is authoritative for every profile. Tool schemas,
examples, legacy parser names, fixtures, and provider instructions describe
requested output only; they do not create CodeScope acceptance requirements.

Suggestion requests may use a corresponding tool call, but its payload shape
is provider output rather than a deterministic CodeScope API contract.
`new-features` is included for the suggestion set where the selected profile
supports it. A response that is not valid JSON is preserved as raw text and is
still useful to the downstream AI consumer.

The `all` operation requests one unified review result from the model. The CLI
prints the returned JSON when parseable, otherwise it prints a best-effort
representation without validating category, finding, or other fields.

This output is not guaranteed to be machine-readable for programmatic
consumers. JSON is used because it is a convenient structured response format
for the model and the downstream AI coding-agent harness, not because
CodeScope guarantees a stable API payload.

The model is instructed to use only supplied evidence and to keep findings
concise. CodeScope does not use ignore comments to suppress findings.
