import { scanOptionStream } from '../options/scan-option-stream.mjs';

export function parseLeadingOptions(tokens) {
  return scanOptionStream(tokens, { leadingOnly: true });
}
