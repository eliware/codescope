import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const combinedResponseContract = readFileSync(
  fileURLToPath(new URL("../../../prompts/policy/combined-response-contract.md", import.meta.url)),
  "utf8",
).trim();
