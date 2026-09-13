export function joinCombinedSections(sections, maxChars = Number.POSITIVE_INFINITY) {
  const included = [];
  let length = 0;
  for (const section of sections) {
    if (!section) continue;
    length += section.length + (included.length ? 1 : 0);
    if (Number.isFinite(maxChars) && length > maxChars)
      throw new Error(`Combined source exceeds the ${maxChars}-character limit`);
    included.push(section);
  }
  return included.join('\n');
}
