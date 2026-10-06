import { isPromptOption } from "./prompt-option-policy.mjs";
import { normalizeTrailingPromptOptions } from "./normalize-trailing-prompt-options.mjs";

export function partitionPromptArgs(args) {
  const delimiter = args.indexOf("--");
  const optionArgs =
    delimiter < 0
      ? args.filter(isPromptOption)
      : normalizeTrailingPromptOptions(args.slice(delimiter + 1));
  return {
    promptArgs:
      delimiter < 0 ? args.filter((value) => !isPromptOption(value)) : args.slice(0, delimiter),
    optionArgs,
  };
}
