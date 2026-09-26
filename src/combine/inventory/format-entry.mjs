import { formatOtherFile } from "../other-metadata.mjs";

export function formatInventoryEntry(relativePath, { bytes, truncated }) {
  if (truncated)
    return `${relativePath} | omitted | at least ${bytes.byteLength} sampled bytes | per-file metadata limit reached`;
  return formatOtherFile(relativePath, bytes);
}
