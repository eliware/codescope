# Structured results

CodeScope writes the provider's raw model response directly to its output. It
does not parse, validate, pretty-print, redact, or otherwise format successful
model output, and it does not expose a stable programmatic response schema.
Review, suggestion, and custom-prompt profiles all exit successfully when the
provider request succeeds. Transport and output-write failures remain errors.

This raw-output rule is authoritative for every profile's provider payload. Tool
schemas, legacy parser names, fixtures, and provider instructions describe
requested output only; they do not create CodeScope acceptance requirements.

Suggestion requests may use a corresponding tool call, but its payload shape
is provider output rather than a deterministic CodeScope API contract.
`new-features` is included for the suggestion set where the selected profile
supports it.

This output is not guaranteed to be machine-readable for programmatic
consumers. JSON may be requested from the model for downstream convenience,
but CodeScope does not interpret or alter it.

The model is instructed to use only supplied evidence and to keep findings
concise. CodeScope does not use ignore comments to suppress findings.
