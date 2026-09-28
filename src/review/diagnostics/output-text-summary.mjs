import { redactTextOutput } from "../redaction/redact-text-output.mjs";
import { readStringProperty } from "../response-accessors/read-string-property.mjs";

export function readOutputTextSummary(response) {
  const outputText = readStringProperty(response, "output_text");
  return outputText === undefined ? undefined : redactTextOutput(outputText);
}
