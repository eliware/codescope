import { TextDecoder } from "node:util";

export const MAX_PACKAGE_JSON_BYTES = 100_000;

export function normalizeInjectedPackageJson(result) {
  const bounded = typeof result === "string" ? { data: result, truncated: false } : result;
  if (bounded === null || typeof bounded !== "object" || typeof bounded.truncated !== "boolean")
    return {
      kind: "unavailable",
      reason: "package.json reader returned invalid bounded content",
    };
  const contents =
    typeof bounded.data === "string"
      ? bounded.data
      : Buffer.isBuffer(bounded.data)
        ? decodePackageJsonBytes(bounded.data)
        : undefined;
  if (
    typeof contents !== "string" ||
    bounded.truncated ||
    Buffer.byteLength(contents) > MAX_PACKAGE_JSON_BYTES
  )
    return { kind: "unavailable", reason: "package.json exceeds the 100000-byte read limit" };
  return { kind: "available", contents };
}

function decodePackageJsonBytes(bytes) {
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes);
}
