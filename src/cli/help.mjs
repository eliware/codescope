import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const helpPath = fileURLToPath(new URL("../../docs/quick-start.md", import.meta.url));

export function usage({ readFile = readFileSync } = {}) {
  return readFile(helpPath, "utf8");
}
