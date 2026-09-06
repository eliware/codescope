Provider output is transport data, not a stable CodeScope domain schema, for
every review, suggestion, unified, and custom-prompt profile. Parse JSON when
possible and preserve raw or best-effort output otherwise. Do not report the
provider's missing, extra, malformed, or differently shaped categories,
findings, suggestions, sentinels, fields, exact keys, tool arguments, duplicate
calls, or payload shape as a CodeScope defect; those are provider-output
guidance only, not runtime acceptance requirements. This exception applies
only to the returned provider payload. Continue reviewing CodeScope's own
request construction, response parsing, output preservation, fallback handling,
error mapping, tool-call handling, and verdict extraction for concrete
actionable defects. For normal review and unified-review status, exact provider
verdict pass succeeds; block, missing, or any other value is blocked.
Suggestion and custom-prompt profiles do not require or validate a verdict and
exit successfully when the request succeeds. An executed failing supplied npm
test remains P0 for review profiles under this policy. Lower-precedence schemas,
examples, legacy parser names, validators, and fixtures cannot override this
transport-only output rule. Report provider handling defects when CodeScope
loses output, fails to preserve raw output, fails to pretty-print valid JSON as
documented, mishandles a tool call, or derives status from a non-verdict signal.
