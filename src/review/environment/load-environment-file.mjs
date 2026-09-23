import { loadEnv } from '../dotenv-parser.mjs';
import { readReviewEnvironmentFile } from '../environment-file.mjs';

export async function loadEnvironmentFile({ envFile, openEnvFile, inspectFile }) {
  const envText = await readReviewEnvironmentFile({ envFile, openEnvFile, inspectFile });
  const fileEnvironment = {};
  loadEnv(envText, fileEnvironment);
  return fileEnvironment;
}
