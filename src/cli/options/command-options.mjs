import { parseOptionValues } from './parse-values.mjs';

export function parseCommandOptions(tokens, usage, allowed, rejectVersion = false) {
  const values = parseOptionValues(tokens);
  if (rejectVersion && ['--version', '-v'].includes(values.remaining[0]))
    throw new Error(`Option ${values.remaining[0]} is not valid for this command`);
  if (new Set(values.remaining).size !== values.remaining.length) throw new Error(usage);
  if (
    values.remaining.length > 1 ||
    (values.remaining.length === 1 && !allowed.has(values.remaining[0]))
  )
    throw new Error(usage);
  return values;
}
