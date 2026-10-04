import { loadEnv } from "../dotenv-parser.mjs";
import { readReviewEnvironmentFile } from "../environment-file.mjs";

export async function loadEnvironmentFile({ envFile, envFileExplicit, openEnvFile, inspectFile }) {
  const envText = await readReviewEnvironmentFile({
    envFile,
    envFileExplicit,
    openEnvFile,
    inspectFile,
  });
  const fileEnvironment = {};
  loadEnv(envText, fileEnvironment);
  return fileEnvironment;
}
