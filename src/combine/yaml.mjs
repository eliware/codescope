import { combineFiles } from "./files.mjs";

export function combineYamlFiles(root, options = {}) {
  return combineFiles(root, [".yaml", ".yml"], options);
}
