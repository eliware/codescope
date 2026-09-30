const HEADER = "===== other files (names and sizes only) =====\n";

function truncationNote(count) {
  return `... inventory truncated: ${count} entries omitted ...`;
}

export function formatInventorySection(entries, maxChars = Number.POSITIVE_INFINITY) {
  const complete = `${HEADER}${entries.join("\n")}\n`;
  if (!Number.isFinite(maxChars) || complete.length <= maxChars) return complete;

  let included = 0;
  let entriesLength = 0;
  for (const entry of entries) {
    const nextLength = entriesLength + (included ? 1 : 0) + entry.length;
    const omitted = entries.length - included - 1;
    const suffix = omitted ? `\n${truncationNote(omitted)}\n` : "\n";
    if (HEADER.length + nextLength + suffix.length > maxChars) break;
    entriesLength = nextLength;
    included += 1;
  }

  const omitted = entries.length - included;
  const body = entries.slice(0, included).join("\n");
  const suffix = `${included ? "\n" : ""}${truncationNote(omitted)}\n`;
  const result = `${HEADER}${body}${suffix}`;
  return result.length <= maxChars ? result : "";
}
