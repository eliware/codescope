import { readAddition } from './read-addition.mjs';
import { readScalar } from './read-scalar.mjs';

export function scanOptionStream(
  tokens,
  { keepScalarOptions = false, leadingOnly = false } = {},
) {
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
      continue;
    }

    const scalar = readScalar(tokens, index);
    if (scalar) {
      (scalar.kind === 'effort' ? effort : model).push(scalar.normalized);
      if (keepScalarOptions) remaining.push(scalar.normalized);
      index = scalar.nextIndex;
      continue;
    }

    if (token === '--dry-run') {
      dryRun += 1;
      if (keepScalarOptions) remaining.push(token);
      continue;
    }
    if (token === '--usage') {
      usage += 1;
      if (!leadingOnly) remaining.push(token);
      continue;
    }
    if (!leadingOnly) {
      remaining.push(token);
      continue;
    }

    remaining.push(...tokens.slice(index));
    break;
  }

  return { add, effort, model, dryRun, usage, remaining, consumed: tokens.length - remaining.length };
}
