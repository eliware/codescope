import { resolveReviewOptions } from './resolve-options.mjs';
import { runReviewPipeline } from './run-review-pipeline.mjs';
export { collectTestResults, redactTestOutput, testEvidenceBlocks } from './test-results.mjs';

export async function runReview(cwd, options) {
  const resolved = resolveReviewOptions(cwd, options);
  return runReviewPipeline(cwd, resolved);
}
