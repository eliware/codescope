export function applyEffort(prompt, effort) {
  const result = structuredClone(prompt);
  if (!effort) return result;
  result.reasoning ??= {};
  result.reasoning.effort = effort;
  return result;
}
