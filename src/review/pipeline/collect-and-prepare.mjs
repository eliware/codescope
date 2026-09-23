import { collectReviewContext } from '../collect-context.mjs';
import { prepareReview } from '../prepare-review.mjs';

export async function collectAndPrepare(cwd, options) {
  const { combined } = await collectReviewContext({ cwd, combine: options.combine, readDirectory: options.readDirectory, readFile: options.readFile, maxSourceChars: options.maxSourceChars, platform: options.platform });
  const { client } = await prepareReview({ envFile: options.envFile, openEnvFile: options.openEnvFile, inspectFile: options.inspectFile, environment: options.environment, createClient: options.createClient });
  return { combined, client };
}
