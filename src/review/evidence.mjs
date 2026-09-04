import { fs } from '@eliware/common';
import { collectReviewTestEvidence } from './test-evidence.mjs';

export async function collectReviewEvidence({
  cwd,
  includesTests,
  omitTestResults,
  testTimeoutMs,
  runTestCommand,
  redactOutput,
  combine,
  readDirectory,
  readFile,
  maxSourceChars,
}) {
  const testResults = await collectReviewTestEvidence({
    cwd,
    includesTests,
    omitTestResults,
    testTimeoutMs,
    runTestCommand,
    redactOutput,
  });
  const combined = await combine(cwd, {
    readDirectory,
    readFileContents: readFile,
    validateSymlinks: readFile === fs.promises.readFile,
    maxChars: maxSourceChars,
    testResults,
  });
  return { testResults, combined };
}
