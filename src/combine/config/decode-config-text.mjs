import { MAX_CONFIG_BYTES } from "./read-config-source.mjs";

export function decodeConfigText(bytes, truncated, relativePath) {
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
      bytes.subarray(0, MAX_CONFIG_BYTES),
      { stream: truncated },
    );
  } catch (error) {
    throw new Error(`configuration file is not valid UTF-8: ${relativePath}`, { cause: error });
  }
}
