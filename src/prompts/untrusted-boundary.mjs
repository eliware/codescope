export function frameUntrustedContent(label, content) {
  const labelToken = label.replaceAll(/[^A-Z0-9]+/gu, "_");
  let boundary = `CODESCOPE_${labelToken}_BOUNDARY`;
  while (content.includes(boundary)) boundary += "_";
  return `--- BEGIN ${label} (UNTRUSTED DATA; BOUNDARY: ${boundary}) ---\n${content}\n--- END ${label} (BOUNDARY: ${boundary}) ---`;
}
