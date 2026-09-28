import { formatRedactedDiagnostic } from "../../../src/review/redaction/format-redacted-diagnostic.mjs";

test("normalizes non-string values before redaction", () => {
  expect(formatRedactedDiagnostic(null)).toEqual({ text: "", truncated: false });
  expect(formatRedactedDiagnostic(42)).toEqual({ text: "42", truncated: false });
});

test("marks diagnostic text truncated at the redaction boundary", () => {
  expect(formatRedactedDiagnostic("x".repeat(500_001)).truncated).toBe(true);
});
