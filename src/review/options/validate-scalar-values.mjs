import { validateModel } from "../../model-policy.mjs";

export function validateReviewScalarValues({
  maxSourceChars,
  model,
  plainText,
  add,
  usage,
  dryRun,
}) {
  if (
    maxSourceChars !== Infinity &&
    (!Number.isFinite(maxSourceChars) || !Number.isInteger(maxSourceChars) || maxSourceChars < 1)
  )
    throw new Error("runReview maxSourceChars must be a positive integer or Infinity");
  if (model !== undefined && (typeof model !== "string" || !model.trim()))
    throw new Error("Model must be a supported model string");
  if (model !== undefined) {
    try {
      validateModel(model);
    } catch {
      throw new Error("Model must be a supported model string");
    }
  }
  if (plainText !== undefined && (typeof plainText !== "string" || !plainText.trim()))
    throw new Error("runReview option plainText must be a non-empty string");
  if (
    add !== undefined &&
    (!Array.isArray(add) || !add.every((value) => typeof value === "string" && value.trim()))
  )
    throw new Error("runReview option add must be an array of strings");
  for (const [name, value] of Object.entries({ usage, dryRun }))
    if (value !== undefined && typeof value !== "boolean")
      throw new Error(`runReview option ${name} must be a boolean`);
}
