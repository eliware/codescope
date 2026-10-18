export function parseDotenvAssignment(line) {
  const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/u);
  if (!match) return null;
  return { name: match[1], value: match[2] };
}

export function parseDotenvValue(value) {
  const raw = stripQuotedInlineComment(value.trim());
  if (
    (raw.startsWith('"') && (!raw.endsWith('"') || !/^"(?:[^"\\]|\\.)*"$/u.test(raw))) ||
    (raw.startsWith("'") && (!raw.endsWith("'") || !/^'(?:[^']|\\')*'$/u.test(raw))) ||
    ((raw.startsWith('"') || raw.startsWith("'")) && raw.length < 2)
  )
    throw new Error("Invalid quoted .env value");
  return raw.startsWith('"')
    ? raw
        .slice(1, -1)
        .replaceAll("\\n", "\n")
        .replaceAll("\\t", "\t")
        .replaceAll('\\"', '"')
        .replaceAll("\\\\", "\\")
    : raw.startsWith("'")
      ? raw.slice(1, -1).replaceAll("\\'", "'")
      : raw.replace(/\s+#.*$/u, "").trim();
}

function stripQuotedInlineComment(raw) {
  const match = raw.match(/^("(?:[^"\\]|\\.)*"|'(?:[^']|\\')*')\s+#.*$/u);
  return match ? match[1] : raw;
}
