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
      const serialized = JSON.stringify({ name, arguments: safeArguments });
      calls.push(serialized);
    } catch {
      // Preserve unaffected calls when one provider item is malformed.
    }
  }
  return calls.length ? `[${calls.join(',')}]` : undefined;
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
