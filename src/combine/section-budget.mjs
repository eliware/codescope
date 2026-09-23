export function createSectionBudget(initialLength, maxChars) {
  let usedChars = initialLength;
  return {
    async read(loadSection) {
      const remaining = Number.isFinite(maxChars)
        ? maxChars - usedChars
        : Number.POSITIVE_INFINITY;
      const section = await loadSection(remaining);
      usedChars += section.length === 0
        ? 0
        : section.length + Math.min(1, Math.sign(usedChars));
      return section;
    },
  };
}
