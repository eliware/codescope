import {
  redactTextOutput,
  MAX_REDACTED_TEXT_LENGTH,
} from "../../../src/review/redaction/redact-text-output.mjs";

test("redacts sensitive provider text", () => {
  expect(redactTextOutput("token=secret")).toBe("token=[REDACTED]");
});

test("bounds redacted output to its configured maximum", () => {
  expect(redactTextOutput("x".repeat(MAX_REDACTED_TEXT_LENGTH + 1))).toHaveLength(
    MAX_REDACTED_TEXT_LENGTH,
  );
});
