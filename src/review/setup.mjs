import { loadReviewEnvironment } from './environment.mjs';

export async function resolveReviewSetup({
  envFile,
  openEnvFile,
  inspectFile,
}) {
  const environment = await loadReviewEnvironment({
    envFile,
    openEnvFile,
    inspectFile,
  });
  const token = environment.OPENAI_API_TOKEN?.trim();
  if (!token) throw new Error('OPENAI_API_TOKEN is missing from ~/.codescope or the environment');
  return { environment, token };
}
