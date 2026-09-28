export const sourceEvidencePolicy = [
  "Use only evidence present in this request: supplied repository files, package.json, and the names-only file inventory.",
  "A names-only inventory proves only that a path exists; it never proves file contents, credentials, permissions, command output, or a security defect.",
  "Do not report secrets or other content-based findings from an inventory name alone.",
].join(" ");
