import { isPromptScalarOption } from "./options/prompt-values.mjs";

export function isPromptOption(value) {
  return ["--dry-run", "--usage"].includes(value) || isPromptScalarOption(value);
}
