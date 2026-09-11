import { redactTestOutput } from './redaction.mjs';
import { readNumericUsage, readStringProperty } from './response-accessors.mjs';

export function preserveProviderResponse(response) {
  if (response === undefined) return undefined;
  try {
    JSON.stringify(response);
    return {
      ...(readStringProperty(response, 'output_text') !== undefined
        ? { output_text: redactTestOutput(readStringProperty(response, 'output_text')) }
        : {}),
      ...(readNumericUsage(response) ? { usage: readNumericUsage(response) } : {}),
      response_error: 'Provider response was not accepted by the response contract',
    };
  } catch {
    return {
      ...(readStringProperty(response, 'output_text') !== undefined
        ? { output_text: redactTestOutput(readStringProperty(response, 'output_text')) }
        : {}),
      ...(readNumericUsage(response) ? { usage: readNumericUsage(response) } : {}),
      response_error: 'Provider response could not be serialized',
    };
  }
}
