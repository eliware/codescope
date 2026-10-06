export const sourceEvidencePolicy = [
  "Use only evidence in this request: supplied files, package.json, and the file-name list.",
  "A file-name list proves only that a path exists. It does not prove file contents, credentials, permissions, command results, or a security defect.",
  "Do not report a secret or other content issue from a file name alone.",
].join(" ");
