export function createSectionBudget(initialLength, maxChars) {
  let usedChars = initialLength;
  let hasEmittedSection = initialLength > 0;
  let exhausted = false;
  return {
    async read(loadSection) {
      if (exhausted) return "";
      const remaining = Number.isFinite(maxChars)
        ? maxChars - usedChars - (hasEmittedSection ? 1 : 0)
        : Number.POSITIVE_INFINITY;
      if (remaining <= 0) {
        exhausted = true;
        return "";
      }
      const section = await loadSection(remaining);
      if (section.length > 0) {
        usedChars += section.length + (hasEmittedSection ? 1 : 0);
        hasEmittedSection = true;
      }
      return section;
    },
  };
}
