import { inspectEnvironmentFile } from "./environment-file/inspect-environment-file.mjs";
import { readEnvironmentFile } from "./environment-file-reader.mjs";

export async function readReviewEnvironmentFile({ envFile, openEnvFile, inspectFile, onFileRead }) {
  const existsAtStartup = await inspectEnvironmentFile(envFile, inspectFile);
  if (existsAtStartup === null) return "";
  const envText = await readEnvironmentFile({ envFile, openEnvFile });
  onFileRead?.();
  return envText;
}
