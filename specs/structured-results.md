# Structured results

Review requests ask the provider for JSON as a transport format only. CodeScope
pretty-prints valid JSON but does not expose or enforce a stable programmatic
response schema. JSON output may be malformed or have any shape; downstream AI
agents can still read and use the raw or best-effort-formatted response. Review
profiles use `verdict` for process status: `pass` exits successfully and every
other or missing verdict is treated as blocked. Suggestion and custom-prompt
profiles do not require or validate a verdict; their provider output is
returned to the downstream AI consumer and exits successfully when the request
itself succeeds.

This transport-only output rule is authoritative for every profile's provider
payload. Tool schemas, examples, legacy parser names, fixtures, and provider
instructions describe requested output only; they do not create CodeScope
acceptance requirements. It does not exempt CodeScope's own request,
response, parsing, preservation, fallback, error, tool-call, or verdict logic
from review.

Suggestion requests may use a corresponding tool call, but its payload shape
is provider output rather than a deterministic CodeScope API contract.
`new-features` is included for the suggestion set where the selected profile
supports it. A response that is not valid JSON is preserved as raw text and is
still useful to the downstream AI consumer.

The `all` operation requests one unified review result from the model. The CLI
prints the returned JSON when parseable, otherwise it prints a best-effort
representation without validating category, finding, or other fields. Failure
fallbacks may preserve a redacted, best-effort subset of a provider response
to avoid echoing secrets or unserializable values. Output-write failures remain
fatal: CodeScope attempts the preserved fallback, but if that write also fails,
the thrown error retains the original failure plus `result` and
`fallbackError` metadata for callers that can inspect it.

This output is not guaranteed to be machine-readable for programmatic
consumers. JSON is used because it is a convenient structured response format
for the model and the downstream AI coding-agent harness, not because
CodeScope guarantees a stable API payload.

The model is instructed to use only supplied evidence and to keep findings
concise. CodeScope does not use ignore comments to suppress findings.
