import { readAddition } from '../options/read-addition.mjs';
import { readScalar } from '../options/read-scalar.mjs';

export function parseLeadingOptions(tokens) {
  const add = [];
  const effort = [];
  const model = [];
  const remaining = [];
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
        index = scalar.nextIndex;
      } else if (token === '--dry-run') {
        dryRun += 1;
      } else if (token === '--usage') {
        usage += 1;
      } else {
        remaining.push(...tokens.slice(index));
        for (let suffix = index; suffix < tokens.length; suffix += 1) {
          if (tokens[suffix] === '-a' || tokens[suffix] === '--add') {
            const addition = readAddition(tokens, suffix);
            add.push(addition.value);
            suffix = addition.nextIndex;
          }
        }
        break;
      }
    }
  }

  return { add, effort, model, dryRun, usage, remaining, consumed: tokens.length - remaining.length };
}
