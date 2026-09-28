import { MAX_CONFIG_BYTES } from "./read-config-source.mjs";

export function normalizeConfigSampleSource(bounded, { readerProvided = false } = {}) {
  validateReaderResult(bounded);
  const source =
    bounded && typeof bounded === "object" && "data" in bounded ? bounded.data : bounded;
  if (typeof source !== "string" && !Buffer.isBuffer(source))
    throw new Error("Configuration reader data must be text or bytes");
  const bytes = Buffer.isBuffer(source) ? source : Buffer.from(source);
  if (readerProvided && bytes.byteLength > MAX_CONFIG_BYTES && bounded?.truncated !== true)
    throw new Error(`Configuration reader exceeded the ${MAX_CONFIG_BYTES}-byte sample boundary`);
  if (bytes.byteLength > MAX_CONFIG_BYTES + 1)
    throw new Error(
      `Configuration reader exceeded the ${MAX_CONFIG_BYTES + 1}-byte sample boundary`,
    );
  return {
    bytes,
    byteTruncated: bytes.byteLength > MAX_CONFIG_BYTES || bounded?.truncated === true,
  };
}

function validateReaderResult(bounded) {
  if (
    bounded &&
    typeof bounded === "object" &&
    !Buffer.isBuffer(bounded) &&
    (!Object.hasOwn(bounded, "data") || typeof bounded.truncated !== "boolean")
  )
    throw new Error("Configuration reader must return text, bytes, or { data, truncated }");
}
