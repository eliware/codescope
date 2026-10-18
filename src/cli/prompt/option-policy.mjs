import { isPromptScalarOption } from "../options/prompt-values.mjs";

export function isPromptOption(value) {
  return (
    ["--dry-run", "--usage", "--debug-request", "--web-search"].includes(value) ||
    isPromptScalarOption(value)
  );
}
