import { readAddition } from "./read-addition.mjs";
import { readScalar } from "./read-scalar.mjs";

export function readOptionEntry(tokens, index) {
  const token = tokens[index];
  if (token === "-a" || token === "--add" || /^(--add|-a)=/u.test(token)) {
    const addition = readAddition(tokens, index);
    return { kind: "addition", value: addition.value, nextIndex: addition.nextIndex };
  }
  const scalar = readScalar(tokens, index);
  if (scalar) return { ...scalar, kind: "scalar", scalarKind: scalar.kind };
  if (token === "--dry-run") return { kind: "dry-run", nextIndex: index };
  if (token === "--usage") return { kind: "usage", nextIndex: index };
  return undefined;
}
