import { loadReviewEnvironment } from './environment.mjs';

export async function resolveReviewSetup({
  envFile,
  readFile,
  readEnvFile = readFile,
  inspectFile,
  inspectPermissions,
  platform,
}) {
  const environment = await loadReviewEnvironment({
    envFile,
    readFile,
    readEnvFile,
    inspectFile,
    inspectPermissions,
    platform,
  });
  const token = environment.OPENAI_API_TOKEN?.trim();
  if (!token) throw new Error('OPENAI_API_TOKEN is missing from ~/.codescope or the environment');
  return { environment, token };
}
