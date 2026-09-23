import { scanOptionStream } from './options/scan-option-stream.mjs';

export function scanOptionTokens(tokens, { keepScalarOptions = false, leadingOnly = false } = {}) {
  return scanOptionStream(tokens, { keepScalarOptions, leadingOnly });
}
