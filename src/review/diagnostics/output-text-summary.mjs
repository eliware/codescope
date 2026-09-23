import { redactTestOutput } from '../redaction.mjs';
import { readStringProperty } from '../response-accessors.mjs';

export function readOutputTextSummary(response) {
  const outputText = readStringProperty(response, 'output_text');
  return outputText === undefined ? undefined : redactTestOutput(outputText);
}
