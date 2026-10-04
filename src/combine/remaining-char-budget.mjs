export function remainingCharBudget(sections, maxChars = Number.POSITIVE_INFINITY) {
  if (!Number.isFinite(maxChars)) return maxChars;
  const included = sections.filter(Boolean);
  const used = included.reduce(
    (total, section) => total + section.length,
    Math.max(0, included.length - 1),
  );
  return Math.max(0, maxChars - used);
}
