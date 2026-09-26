const MAX_CONFIG_LINES = 200;

export function formatConfigSection(relativePath, { text, byteTruncated }) {
  const lines = text.split(/\r\n|\r|\n/u);
  // codescope ignore: remove the final-newline split artifact before applying the line limit.
  while (lines.at(-1) === "") lines.pop();
  const lineTruncated = lines.length > MAX_CONFIG_LINES;
  const visibleLines = lines.slice(0, MAX_CONFIG_LINES);
  const width = String(visibleLines.length).length;
  const body = visibleLines.map(
    (line, index) => `${String(index + 1).padStart(width, " ")} ${line}`,
  );
  if (byteTruncated || lineTruncated)
    body.push(
      byteTruncated && !lineTruncated
        ? "[truncated after the per-file byte limit; remaining config omitted]"
        : `[truncated after ${MAX_CONFIG_LINES} lines; remaining config omitted]`,
    );
  return `===== ${relativePath} =====\n${body.join("\n")}\n`;
}
