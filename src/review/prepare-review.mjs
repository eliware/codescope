import { initializeReviewClient } from './client.mjs';
import { resolveReviewSetup } from './setup.mjs';

export async function prepareReview({
  envFile,
  openEnvFile,
  inspectFile,
  createClient,
}) {
  const { token } = await resolveReviewSetup({
    envFile,
    openEnvFile,
    inspectFile,
  });
  return { token, client: initializeReviewClient(createClient, token) };
}
