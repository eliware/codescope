import { redactTestOutput } from './redaction.mjs';
import { readNumericUsage, readStringProperty } from './response-accessors.mjs';

function readFunctionCallArguments(response) {
  try {
    const calls = Array.isArray(response?.output) && response.output
      ?.filter((item) => item?.type === 'function_call')
      .map(({ name, arguments: args }) => ({ name, arguments: args }));
    return calls?.length ? redactTestOutput(JSON.stringify(calls)) : undefined;
  } catch {
    return undefined;
  }
}

export function preserveProviderResponse(response) {
  if (response === undefined) return undefined;
  const functionCallArguments = readFunctionCallArguments(response);
  const outputText = readStringProperty(response, 'output_text');
  const usage = readNumericUsage(response);
  const summary = {
    ...(outputText !== undefined ? { output_text: redactTestOutput(outputText) } : {}),
    ...(usage ? { usage } : {}),
    ...(functionCallArguments ? { function_call_arguments: functionCallArguments } : {}),
  };
  try {
    JSON.stringify(response);
    return {
      ...summary,
      response_error: 'Provider response was not accepted by the response contract',
    };
  } catch {
    return {
      ...summary,
      response_error: 'Provider response could not be serialized',
    };
  }
}
