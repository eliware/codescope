import { readFunctionCallArguments } from './diagnostics/function-call-summary.mjs';
import { readOutputTextSummary } from './diagnostics/output-text-summary.mjs';
import { readUsageSummary } from './diagnostics/usage-summary.mjs';

export function summarizeProviderResponse(response) {
  const functionCallArguments = readFunctionCallArguments(response);
  const outputText = readOutputTextSummary(response);
  const usage = readUsageSummary(response);
  return {
    ...(outputText !== undefined ? { output_text: outputText } : {}),
    ...(usage ? { usage } : {}),
    ...(functionCallArguments ? { function_call_arguments: functionCallArguments } : {}),
  };
}

export function safeResponseSummary(response) {
  try {
    return summarizeProviderResponse(response);
  } catch {
    return {};
  }
}
