import os from 'node:os';
import path from 'node:path';

export function defaultEnvFile() {
  return path.join(os.homedir(), '.codescope');
}

export function loadEnv(text = '', environment) {
  const seen = new Set();
  for (const line of text.split(/\r?\n/u)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/u);
    if (!match) {
      if (line.trim() && !line.trim().startsWith('#')) throw new Error('Invalid .env line');
      continue;
    }

    if (seen.has(match[1])) continue;
    seen.add(match[1]);

    if (environment[match[1] ?? '']?.trim()) continue;
    const raw = match[2].trim();

    if (
      (raw.startsWith('"') && (!raw.endsWith('"') || !/^"(?:[^"\\]|\\.)*"$/u.test(raw))) ||
      (raw.startsWith("'") && (!raw.endsWith("'") || !/^'(?:[^']|\\')*'$/u.test(raw))) ||
      ((raw.startsWith('"') || raw.startsWith("'")) && raw.length < 2)
    )
      throw new Error('Invalid quoted .env value');
    const value = raw.startsWith('"')
      ? raw
          .slice(1, -1)
          .replaceAll('\\n', '\n')
          .replaceAll('\\t', '\t')
          .replaceAll('\\"', '"')
          .replaceAll('\\\\', '\\')
      : raw.startsWith("'")
        ? raw.slice(1, -1).replaceAll("\\'", "'")
        : raw.replace(/\s+#.*$/u, '').trim();
    if (!value.trim()) continue;
    if (match[1] === 'OPENAI_API_TOKEN') environment[match[1]] = value;
  }
}
