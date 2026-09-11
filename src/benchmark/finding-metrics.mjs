export function countFindings(groups, field, emptyValue) {
  return Object.values(groups ?? {})
    .flat()
    .filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        typeof item[field] === 'string' &&
        item[field] !== emptyValue,
    ).length;
}

export function findingCounts(report) {
  const groups = report?.findings ?? report?.issues;
  return {
    issues: report
      ? countFindings(groups, report.findings ? 'finding' : 'issue', 'No issues found.')
      : null,
    suggestions: report
      ? countFindings(report.suggestions, 'suggestion', 'No suggestions found.')
      : null,
  };
}
