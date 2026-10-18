import { EXIT_CODES } from "../exit-codes.mjs";

export function classifyInputMessage(text) {
  return /Cannot (read|inspect)|ENOENT|input file|source file/u.test(text)
    ? EXIT_CODES.INPUT
    : undefined;
}
