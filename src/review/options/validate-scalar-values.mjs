import { validateSourceLimit } from "./validate-source-limit.mjs";
import { validateModelOption } from "./validate-model-option.mjs";
import { validatePromptOptions } from "./validate-prompt-options.mjs";
import { validateModeFlags } from "./validate-mode-flags.mjs";

export function validateReviewScalarValues({
  maxSourceChars,
  model,
  plainText,
  add,
  usage,
  dryRun,
}) {
  validateSourceLimit(maxSourceChars);
  validateModelOption(model);
  validatePromptOptions({ plainText, add });
  validateModeFlags({ usage, dryRun });
}
