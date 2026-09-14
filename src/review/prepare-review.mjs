import { initializeReviewClient } from './client.mjs';
import { resolveReviewSetup } from './setup.mjs';

export async function prepareReview({
  envFile,
  openEnvFile,
  inspectFile,
  createClient,
}) {
  const { environment, token } = await resolveReviewSetup({
    envFile,
    openEnvFile,
    inspectFile,
  });
  return { environment, token, client: initializeReviewClient(createClient, token) };
}
