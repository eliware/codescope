import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const promptDirectory = new URL("../../../prompts/", import.meta.url);

export function readPrompt(name) {
  return readFileSync(fileURLToPath(new URL(name, promptDirectory)), "utf8")
    .replaceAll("\\u002d", "-")
    .replaceAll("\\u0052", "R")
    .replace(/\n\n\{\{CONTENT\}\}\n/g, "\n{{CONTENT}}\n")
    .trimEnd();
}

export function fillPrompt(name, values) {
  let prompt = readPrompt(name);
  for (const [key, value] of Object.entries(values)) {
    prompt = prompt.replaceAll("{{" + key + "}}", () => value);
  }
  return prompt;
}
