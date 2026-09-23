import { redactTestOutput } from '../redaction.mjs';

export function readFunctionCallArguments(response) {
  if (!Array.isArray(response?.output)) return undefined;
  const calls = [];
  for (const item of response.output) {
    try {
      if (item?.type !== 'function_call') continue;
      const rawName = typeof item.name === 'string' ? item.name : JSON.stringify(item.name);
      if (typeof rawName !== 'string') continue;
      const rawArguments = typeof item.arguments === 'string'
        ? item.arguments
        : JSON.stringify(item.arguments);
      if (typeof rawArguments !== 'string') continue;
      calls.push({ name: redactTestOutput(rawName), arguments: redactTestOutput(rawArguments) });
    } catch {
      // Preserve unaffected calls when one provider item is malformed.
    }
  }
  return calls.length ? calls : undefined;
}
