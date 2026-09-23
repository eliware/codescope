import { readAddition } from './options/read-addition.mjs';
import { readScalar } from './options/read-scalar.mjs';

export function scanOptionTokens(tokens, { keepScalarOptions = false, leadingOnly = false } = {}) {
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
    } else if (readScalar(tokens, index)) {
      const scalar = readScalar(tokens, index);
      (scalar.kind === 'effort' ? effort : model).push(scalar.normalized);
      if (keepScalarOptions) remaining.push(scalar.normalized);
      index = scalar.nextIndex;
    } else if (token === '--dry-run') {
      dryRun += 1;
      if (keepScalarOptions) remaining.push(token);
    } else if (token === '--usage') {
      usage += 1;
      if (!leadingOnly) remaining.push(token);
    } else if (leadingOnly) {
      remaining.push(...tokens.slice(index));
      for (let suffix = index; suffix < tokens.length; suffix += 1) {
        if (tokens[suffix] === '-a' || tokens[suffix] === '--add') {
          const addition = readAddition(tokens, suffix);
          add.push(addition.value);
          suffix = addition.nextIndex;
        }
      }
      break;
    } else remaining.push(token);
  }
  return { add, effort, model, dryRun, usage, remaining, consumed: tokens.length - remaining.length };
}
