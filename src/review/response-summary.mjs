import { redactTestOutput } from './redaction.mjs';
import { readNumericUsage, readStringProperty } from './response-accessors.mjs';

function readFunctionCallArguments(response) {
  if (!Array.isArray(response?.output)) return undefined;
  const calls = [];
  for (const item of response.output) {
    try {
      if (item?.type !== 'function_call') continue;
      const rawName = typeof item.name === 'string' ? item.name : JSON.stringify(item.name);
      if (typeof rawName !== 'string') continue;
      const name = redactTestOutput(rawName);
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
  return calls.length ? calls : undefined;
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
