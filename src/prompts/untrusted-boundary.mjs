export function frameUntrustedContent(label, content) {
  const labelToken = label.replaceAll(/[^A-Z0-9]+/gu, "_");
  let boundary = `CODESCOPE_${labelToken}_BOUNDARY`;
  let suffixLength = 0;
  let collision = false;
  for (const match of content.matchAll(new RegExp(`${boundary}_*`, "gu"))) {
    collision = true;
    suffixLength = Math.max(suffixLength, match[0].length - boundary.length);
  }
  if (collision) boundary += "_".repeat(suffixLength + 1);
  return `--- BEGIN ${label} (UNTRUSTED DATA; BOUNDARY: ${boundary}) ---\n${content}\n--- END ${label} (BOUNDARY: ${boundary}) ---`;
}
