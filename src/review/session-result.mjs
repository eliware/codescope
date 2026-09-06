import { parsePlainTextJsonResponse } from './plain-text.mjs';
import { testEvidenceBlocks } from './test-status.mjs';
import { withReviewUsage, readProviderUsage } from './usage.mjs';

export function plainTextSessionResult(providerResponse, usage) {
  const output = parsePlainTextJsonResponse(providerResponse);
  return {
    output,
    result: { ...output, ...(usage ? { usage: readProviderUsage(providerResponse) } : {}) },
  };
}

export function reviewSessionResult(providerResponse, request, model, usage, testResults, parse) {
  const result = parse(providerResponse, request);
  if (result.verdict === 'pass' && testEvidenceBlocks(testResults)) result.verdict = 'block';
  return withReviewUsage(result, providerResponse, model, usage);
}
