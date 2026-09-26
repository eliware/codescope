import { MAX_CONFIG_BYTES } from "./read-config-source.mjs";

export function readConfigSample(bounded, { readerProvided = false, relativePath = "" } = {}) {
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
  const byteTruncated = bytes.byteLength > MAX_CONFIG_BYTES || bounded?.truncated === true;
  if (bytes.includes(0)) return { binary: true, byteTruncated, text: "" };
  return {
    binary: false,
    byteTruncated,
    text: decodeConfigText(bytes, byteTruncated, relativePath),
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

function decodeConfigText(bytes, truncated, relativePath) {
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
      bytes.subarray(0, MAX_CONFIG_BYTES),
      { stream: truncated },
    );
  } catch (error) {
    throw new Error(`configuration file is not valid UTF-8: ${relativePath}`, { cause: error });
  }
}
