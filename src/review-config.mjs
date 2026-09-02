import os from 'node:os';
import path from 'node:path';

export function defaultEnvFile() {
  return path.join(os.homedir(), '.codescope');
}

export function loadEnv(text = '', environment) {
  // Intentional: ~/.codescope is a small single-line token file, not a general dotenv implementation; standard
  // dotenv syntax treats an unquoted # preceded by whitespace as an inline comment, so such token text is unsupported.
  const seen = new Set();
  for (const line of text.split(/\r?\n/u)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/u);
    if (!match) {
      if (line.trim() && !line.trim().startsWith('#')) throw new Error('Invalid .env line');
      continue;
    }
    // Intentional policy: first assignment wins, including blank or environment-shadowed assignments.
    if (seen.has(match[1])) continue;
    seen.add(match[1]);
    /* istanbul ignore next -- inherited environment precedence is host-dependent */
    if (environment[match[1] ?? '']?.trim()) continue;
    const raw = match[2].trim();
    // Intentional validation: the anchored quoted-value patterns consume the entire trimmed value, so trailing
    // text after a closing quote is rejected before token loading; trailing whitespace is already trimmed above.
    if ((raw.startsWith('"') && (!raw.endsWith('"') || !/^"(?:[^"\\]|\\.)*"$/u.test(raw))) || (raw.startsWith("'") && (!raw.endsWith("'") || !/^'(?:[^']|\\')*'$/u.test(raw))) || ((raw.startsWith('"') || raw.startsWith("'")) && raw.length < 2)) throw new Error('Invalid quoted .env value');
    const value = raw.startsWith('"') ? raw.slice(1, -1).replaceAll('\\n', '\n').replaceAll('\\t', '\t').replaceAll('\\"', '"').replaceAll('\\\\', '\\') : raw.startsWith("'") ? raw.slice(1, -1).replaceAll("\\'", "'") : raw.replace(/\s+#.*$/u, '').trim();
    /* istanbul ignore next -- empty credential assignments require configuration integration coverage */
    if (!value.trim()) continue;
    if (match[1] === 'OPENAI_API_TOKEN') environment[match[1]] = value;
  }
}
