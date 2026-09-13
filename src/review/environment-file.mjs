import { defaultEnvFile } from './env-file-path.mjs';

export async function readReviewEnvironmentFile({ envFile, readEnvFile, inspectFile }) {
  let envText = '';
  if (envFile === defaultEnvFile()) {
    try {
      const metadata = await inspectFile(envFile);
      if (metadata.isSymbolicLink()) throw new Error('~/.codescope must not be a symbolic link');
    } catch (cause) {
      if (cause?.code !== 'ENOENT')
        throw new Error(
          `Unable to inspect ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
          { cause },
        );
    }
  }
  try {
    envText = await readEnvFile(envFile, 'utf8');
  } catch (cause) {
    if (cause?.code !== 'ENOENT')
      throw new Error(
        `Unable to read ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
  }
  return envText;
}
