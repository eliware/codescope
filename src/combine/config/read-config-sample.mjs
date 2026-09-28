import { normalizeConfigSampleSource } from "./normalize-config-sample-source.mjs";
import { decodeConfigText } from "./decode-config-text.mjs";

export function readConfigSample(bounded, { readerProvided = false, relativePath = "" } = {}) {
  const { bytes, byteTruncated } = normalizeConfigSampleSource(bounded, { readerProvided });
  if (bytes.includes(0)) return { binary: true, byteTruncated, text: "" };
  return {
    binary: false,
    byteTruncated,
    text: decodeConfigText(bytes, byteTruncated, relativePath),
  };
}
