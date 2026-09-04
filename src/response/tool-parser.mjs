import { getFunctionCalls, responseError } from './calls.mjs';

export function parseToolArguments(response, toolName) {
  const calls = getFunctionCalls(response, toolName);
  if (calls.length !== 1 || typeof calls[0].arguments !== 'string')
    throw responseError(`OpenAI response did not contain exactly one ${toolName} tool call`);
  try {
    return JSON.parse(calls[0].arguments);
  } catch (cause) {
    throw responseError(`OpenAI ${toolName} tool arguments were not valid JSON`, cause);
  }
}
