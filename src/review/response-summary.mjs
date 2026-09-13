import { redactTestOutput } from './redaction.mjs';
import { readNumericUsage, readStringProperty } from './response-accessors.mjs';

function readFunctionCallArguments(response) {
  if (!Array.isArray(response?.output)) return undefined;
  const calls = [];
  for (const item of response.output) {
    try {
      if (item?.type !== 'function_call') continue;
      calls.push({ name: item.name, arguments: item.arguments });
    } catch {
      // Preserve unaffected calls when one provider item is malformed.
    }
  }
  try {
    return calls.length ? redactTestOutput(JSON.stringify(calls)) : undefined;
  } catch {
    return undefined;
  }
}

export function summarizeProviderResponse(response) {
  const functionCallArguments = readFunctionCallArguments(response);
  const outputText = readStringProperty(response, 'output_text');
  const usage = readNumericUsage(response);
  return {
    ...(outputText !== undefined ? { output_text: redactTestOutput(outputText) } : {}),
    ...(usage ? { usage } : {}),
    ...(functionCallArguments ? { function_call_arguments: functionCallArguments } : {}),
  };
}
