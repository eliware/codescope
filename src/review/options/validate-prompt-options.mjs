export function validatePromptOptions({ plainText, add }) {
  if (plainText !== undefined && (typeof plainText !== "string" || !plainText.trim()))
    throw new Error("runReview option plainText must be a non-empty string");
  if (
    add !== undefined &&
    (!Array.isArray(add) || !add.every((value) => typeof value === "string" && value.trim()))
  )
    throw new Error("runReview option add must be an array of strings");
}
