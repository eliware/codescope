import { readFile } from 'node:fs/promises';
import path from 'node:path';

const MAX_CONFIG_LINES = 200;

export async function combineConfigFiles(root, { inventory, readFileContents = readFile } = {}) {
  const configFiles = inventory.filter((relativePath) => {
    const normalized = relativePath.toLowerCase();
    return normalized.startsWith('.github/') || normalized.startsWith('.knit/');
  });
  const sections = await Promise.all(configFiles.map(async (relativePath) => {
    const data = await readFileContents(path.join(root, relativePath));
    const bytes = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
    if (bytes.includes(0)) return '';
    const contents = bytes.toString('utf8');
    const lines = contents.replace(/(?:\r\n|\r|\n)$/u, '').split(/\r\n|\r|\n/u);
    const truncated = lines.length > MAX_CONFIG_LINES;
    const visibleLines = lines.slice(0, MAX_CONFIG_LINES);
    const width = String(visibleLines.length).length;
    const body = visibleLines.map((line, index) => `${String(index + 1).padStart(width, ' ')} ${line}`);
    if (truncated) body.push(`[truncated after ${MAX_CONFIG_LINES} lines; remaining config omitted]`);
    return `===== ${relativePath} =====\n${body.join('\n')}\n`;
  }));
  const included = sections.filter(Boolean);
  return included.length ? `===== repository configuration =====\n${included.join('\n')}` : '';
}
