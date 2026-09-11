export function testEvidenceBlocks(testResults) {
  if (typeof testResults !== 'string') return false;
  const matches = [...testResults.matchAll(/(?:^|\r?\n)===== npm test =====\r?\n([^\r\n]*)/gu)];
  if (!matches.length) return false;
  return matches.some((match, index) => {
    const status = match[1].trim();
    const end = matches[index + 1]?.index ?? testResults.length;
    const section = testResults.slice(match.index, end);
    return (
      /^(?:exit code:\s*(?:[1-9]\d*|unknown)|timed out after\b|runner error:|fail\b|failed\b)/iu.test(
        status,
      ) ||
      /\b(?:tests?\s+failed|test suites?\s+failed|failed\s+\(|npm\s+err!|error:\s+|exit(?:ed|s)?\s+with\s+(?:a\s+)?non[- ]zero\s+code)/iu.test(
        section,
      ) ||
      /^\s*(?:fail|failed)\b/mu.test(section)
    );
  });
}
