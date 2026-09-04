export function testEvidenceBlocks(testResults) {
  if (typeof testResults !== 'string') return false;
  const match = testResults.match(/(?:^|\r?\n)===== npm test =====\r?\n([^\r\n]*)/u);
  if (!match) return false;
  const status = match[1].trim();
  return /^(?:exit code:\s*(?:[1-9]\d*|unknown)|timed out after\b)/iu.test(status);
}
