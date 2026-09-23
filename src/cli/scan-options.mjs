import { readAddition } from './options/read-addition.mjs';
import { readScalar } from './options/read-scalar.mjs';
import { parseLeadingOptions } from './args/parse-leading-options.mjs';

export function scanOptionTokens(tokens, { keepScalarOptions = false, leadingOnly = false } = {}) {
  if (leadingOnly) return parseLeadingOptions(tokens);
  const add = [];
  const remaining = [];
  const effort = [];
  const model = [];
  let dryRun = 0;
  let usage = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === '-a' || token === '--add') {
      const addition = readAddition(tokens, index);
      add.push(addition.value);
      index = addition.nextIndex;
    } else {
      const scalar = readScalar(tokens, index);
      if (scalar) {
        (scalar.kind === 'effort' ? effort : model).push(scalar.normalized);
        if (keepScalarOptions) remaining.push(scalar.normalized);
        index = scalar.nextIndex;
      } else if (token === '--dry-run') {
        dryRun += 1;
        if (keepScalarOptions) remaining.push(token);
      } else if (token === '--usage') {
        usage += 1;
        remaining.push(token);
      } else {
        remaining.push(token);
      }
    }
  }
  return { add, effort, model, dryRun, usage, remaining, consumed: tokens.length - remaining.length };
}
