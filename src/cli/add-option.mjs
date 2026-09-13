import { scanOptionTokens } from './scan-options.mjs';

export function parseAddOptions(tokens) {
  const values = scanOptionTokens(tokens, { keepScalarOptions: true });
  return { add: values.add, remaining: values.remaining };
}
