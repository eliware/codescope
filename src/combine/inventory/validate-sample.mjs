import { MAX_OTHER_FILE_BYTES } from "../other-policy.mjs";

export function validateInventorySample(result) {
  if (
    !result ||
    typeof result !== "object" ||
    !("data" in result) ||
    typeof result.truncated !== "boolean"
  )
    throw new Error("Other-file reader must return { data, truncated }");
  const bytes = Buffer.isBuffer(result.data) ? result.data : Buffer.from(String(result.data));
  if (bytes.byteLength > MAX_OTHER_FILE_BYTES + 1)
    throw new Error(
      `Other-file reader exceeded the ${MAX_OTHER_FILE_BYTES + 1}-byte sample boundary`,
    );
  if (bytes.byteLength > MAX_OTHER_FILE_BYTES && result.truncated !== true)
    throw new Error("Other-file reader returned oversized data without truncated=true");
  if (result.truncated && bytes.byteLength <= MAX_OTHER_FILE_BYTES)
    throw new Error("Other-file reader marked an in-limit sample as truncated");
  return { bytes, truncated: result.truncated };
}
