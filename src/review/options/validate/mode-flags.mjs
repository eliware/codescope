export function validateModeFlags({ usage, dryRun }) {
  for (const [name, value] of Object.entries({ usage, dryRun }))
    if (value !== undefined && typeof value !== "boolean")
      throw new Error(`runReview option ${name} must be a boolean`);
}
