export function loadEnv(text = "", environment) {
  if (!environment || typeof environment !== "object" || Array.isArray(environment))
    throw new Error("Environment must be a mutable object");
  for (const line of text.split(/\r?\n/u)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/u);
    if (!match) {
      if (/^\s*(?:export\s+)?OPENAI_API_TOKEN\b/u.test(line)) throw new Error("Invalid .env line");
      continue;
    }
    if (match[1] !== "OPENAI_API_TOKEN") continue;
    const raw = stripQuotedInlineComment(match[2].trim());
    if (
      (raw.startsWith('"') && (!raw.endsWith('"') || !/^"(?:[^"\\]|\\.)*"$/u.test(raw))) ||
      (raw.startsWith("'") && (!raw.endsWith("'") || !/^'(?:[^']|\\')*'$/u.test(raw))) ||
      ((raw.startsWith('"') || raw.startsWith("'")) && raw.length < 2)
    )
      throw new Error("Invalid quoted .env value");
    if (environment[match[1]]?.trim()) continue;
    const value = raw.startsWith('"')
      ? raw
          .slice(1, -1)
          .replaceAll("\\n", "\n")
          .replaceAll("\\t", "\t")
          .replaceAll('\\"', '"')
          .replaceAll("\\\\", "\\")
      : raw.startsWith("'")
        ? raw.slice(1, -1).replaceAll("\\'", "'")
        : raw.replace(/\s+#.*$/u, "").trim();
    if (!value.trim()) continue;
    environment[match[1]] = value;
  }
}

function stripQuotedInlineComment(raw) {
  const match = raw.match(/^("(?:[^"\\]|\\.)*"|'(?:[^']|\\')*')\s+#.*$/u);
  return match ? match[1] : raw;
}
