import { initializeReviewClient } from "./client.mjs";
import { resolveReviewSetup } from "./setup.mjs";

export async function prepareReview({
  envFile,
  envFileExplicit,
  openEnvFile,
  inspectFile,
  createClient,
}) {
  const { token } = await resolveReviewSetup({
    envFile,
    envFileExplicit,
    openEnvFile,
    inspectFile,
  });
  return { token, client: initializeReviewClient(createClient, token) };
}
