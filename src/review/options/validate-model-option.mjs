import { validateModel } from "../../model-policy.mjs";

export function validateModelOption(model) {
  if (model === undefined) return;
  if (typeof model !== "string" || !model.trim())
    throw new Error("Model must be a supported model string");
  try {
    validateModel(model);
  } catch {
    throw new Error("Model must be a supported model string");
  }
}
