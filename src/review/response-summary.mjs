import { redactTestOutput } from './redaction.mjs';
import { readNumericUsage, readStringProperty } from './response-accessors.mjs';

function readFunctionCallArguments(response) {
  if (!Array.isArray(response?.output)) return undefined;
  const calls = [];
  for (const item of response.output) {
    try {
      if (item?.type !== 'function_call') continue;
      const name = typeof item.name === 'string' ? redactTestOutput(item.name) : item.name;
      const argumentsValue = item.arguments;
      const safeArguments =
        typeof argumentsValue === 'string'
          ? redactTestOutput(argumentsValue)
          : redactTestOutput(JSON.stringify(argumentsValue));
      calls.push({ name, arguments: safeArguments });
    } catch {
      // Preserve unaffected calls when one provider item is malformed.
    }
  }
  try {
    return calls.length ? JSON.stringify(calls) : undefined;
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
