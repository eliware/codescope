import { inspectEnvironmentFile } from "./environment-file/inspect-environment-file.mjs";
import { readEnvironmentFile } from "./environment-file-reader.mjs";

export async function readReviewEnvironmentFile({
  envFile,
  envFileExplicit,
  openEnvFile,
  inspectFile,
  onFileRead,
}) {
  const existsAtStartup = await inspectEnvironmentFile(envFile, inspectFile, envFileExplicit);
  if (existsAtStartup === null) return "";
  const envText = await readEnvironmentFile({ envFile, openEnvFile });
  onFileRead?.();
  return envText;
}
