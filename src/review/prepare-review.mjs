import { initializeReviewClient } from './client.mjs';
import { resolveReviewSetup } from './setup.mjs';

export async function prepareReview({
  envFile,
  readFile,
  readEnvFile,
  inspectFile,
  inspectPermissions,
  platform,
  createClient,
}) {
  const { environment, token } = await resolveReviewSetup({
    envFile,
    readFile,
    readEnvFile,
    inspectFile,
    inspectPermissions,
    platform,
  });
  return { environment, token, client: initializeReviewClient(createClient, token) };
}
