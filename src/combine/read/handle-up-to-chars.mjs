import { StringDecoder } from "node:string_decoder";

const MAX_READ_BYTES = 64 * 1024;
const OVERFLOW_MARKER = "�";

function overflowSample(text, maxChars) {
  const prefix = text.slice(0, maxChars);
  const last = prefix.charCodeAt(prefix.length - 1);
  const endsInHighSurrogate = last >= 0xd800 && last <= 0xdbff;
  return endsInHighSurrogate
    ? `${prefix.slice(0, -1)}${OVERFLOW_MARKER}${OVERFLOW_MARKER}`
    : `${prefix}${OVERFLOW_MARKER}`;
}

export async function readHandleUpToChars(handle, maxChars) {
  const decoder = new StringDecoder("utf8");
  const chunks = [];
  let totalChars = 0;
  while (true) {
    const readLength = Math.max(1, Math.min(MAX_READ_BYTES, maxChars - totalChars + 1));
    const buffer = Buffer.alloc(readLength);
    const { bytesRead } = await handle.read(buffer, 0, readLength, null);
    const decoded = decoder.write(buffer.subarray(0, bytesRead));
    chunks.push(decoded);
    totalChars += decoded.length;
    if (totalChars > maxChars) return overflowSample(chunks.join(""), maxChars);
    if (bytesRead === 0) {
      chunks.push(decoder.end());
      return chunks.join("");
    }
  }
}
