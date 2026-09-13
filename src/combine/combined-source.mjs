export function joinCombinedSections(sections, maxChars = Number.POSITIVE_INFINITY) {
  const combined = sections.filter(Boolean).join('\n');
  if (Number.isFinite(maxChars) && combined.length > maxChars)
    throw new Error(`Combined source exceeds the ${maxChars}-character limit`);
  return combined;
}
