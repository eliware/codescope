import { testEvidenceBlocks } from './test-status.mjs';
import { withReviewUsage } from './usage.mjs';

export function reviewSessionResult(providerResponse, request, model, usage, testResults, parse) {
  const result = parse(providerResponse, request);
  if (result.verdict === 'pass' && testEvidenceBlocks(testResults)) result.verdict = 'block';
  return withReviewUsage(result, providerResponse, model, usage);
}
