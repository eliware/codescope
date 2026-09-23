import { inspectEnvironmentFile } from './environment-file/inspect-environment-file.mjs';
import { readStableEnvironmentFile } from './stable-environment-reader.mjs';

export async function readReviewEnvironmentFile({
  envFile,
  openEnvFile,
  inspectFile,
  onFileRead,
}) {
  const initialIdentity = await inspectEnvironmentFile(envFile, inspectFile);
  if (initialIdentity === null) return '';
  const envText = await readStableEnvironmentFile({ envFile, openEnvFile, initialIdentity });
  onFileRead?.();
  return envText;
}
