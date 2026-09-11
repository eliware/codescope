import os from 'node:os';
import path from 'node:path';

export function defaultEnvFile() {
  return path.join(os.homedir(), '.codescope');
}
