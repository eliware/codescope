import { readOptionEntry } from "./read-option-entry.mjs";

export function scanOptionStream(tokens, { keepScalarOptions = false, leadingOnly = false } = {}) {
  const add = [];
  const remaining = [];
  const effort = [];
  const model = [];
  let dryRun = 0;
  let usage = 0;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const option = readOptionEntry(tokens, index);
    if (option?.kind === "addition") {
      add.push(option.value);
      index = option.nextIndex;
      continue;
    }
    if (option?.kind === "scalar") {
      (option.scalarKind === "effort" ? effort : model).push(option.normalized);
      if (keepScalarOptions) remaining.push(option.normalized);
      index = option.nextIndex;
      continue;
    }
    if (option?.kind === "dry-run") {
      dryRun += 1;
      if (keepScalarOptions) remaining.push(token);
      continue;
    }
    if (option?.kind === "usage") {
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

  return {
    add,
    effort,
    model,
    dryRun,
    usage,
    remaining,
    consumed: tokens.length - remaining.length,
  };
}
