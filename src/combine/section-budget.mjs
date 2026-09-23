export function createSectionBudget(initialLength, maxChars) {
  let usedChars = initialLength;
  let hasEmittedSection = initialLength > 0;
  return {
    async read(loadSection) {
      const remaining = Number.isFinite(maxChars)
        ? maxChars - usedChars - (hasEmittedSection ? 1 : 0)
        : Number.POSITIVE_INFINITY;
      const section = await loadSection(remaining);
      if (section.length > 0) {
        usedChars += section.length + (hasEmittedSection ? 1 : 0);
        hasEmittedSection = true;
      }
      return section;
    },
  };
}
