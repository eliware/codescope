import { initializeReviewClient } from './client.mjs';
import { resolveReviewSetup } from './setup.mjs';

export async function prepareReview({
  envFile,
  readFile,
  readEnvFile,
  openEnvFile,
  inspectFile,
  createClient,
}) {
  const { environment, token } = await resolveReviewSetup({
    envFile,
    readFile,
    readEnvFile,
    openEnvFile,
    inspectFile,
  });
  return { environment, token, client: initializeReviewClient(createClient, token) };
}
