export function formatSourceSection(relativePath, contents) {
  const trimmed = contents.replace(/(?:\r\n|\r|\n)$/u, '');
  const lines = trimmed === '' ? ['[empty file]'] : trimmed.split(/\r\n|\r|\n/u);
  const width = String(lines.length).length;
  const numbered = lines
    .map((line, index) => `${String(index + 1).padStart(width, ' ')} ${line}`)
    .join('\n');
  return `===== ${relativePath} =====\n${numbered}\n`;
}
