Provider output is transport data, not a stable CodeScope domain schema, for
every review, suggestion, unified, and custom-prompt profile. CodeScope writes
the exact provider response unchanged. It does not parse, validate, redact,
pretty-print, or derive status from the returned payload. All successful
provider requests exit successfully. Do not report provider payload shape as a
CodeScope defect; review only request construction, transport failures, and
output-write failures.
