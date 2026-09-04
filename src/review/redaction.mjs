const MAX_TEST_OUTPUT = 500_000;

export const redactTestOutput = (value) =>
  String(value ?? '')
    .replace(
      /((?:api[_-]?key|token|password|secret)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s]+)/giu,
      '$1[redacted]',
    )
    .replace(
      /((?:["']?(?:api[_-]?key|token|password|secret)["']?\s*:\s*))(?:"[^"]*"|'[^']*'|[^\s,}]+)/giu,
      '$1[redacted]',
    )
    .replace(/((?:[A-Z][A-Z0-9_]{2,})\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s]+)/gu, '$1[redacted]')
    .replace(/\b(?:sk|ghp|github_pat|xoxb)-[A-Za-z0-9_-]+/gu, '[redacted]')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+/giu, 'Bearer [redacted]')
    .replace(/([?&](?:api[_-]?key|token|password|secret)=)[^&#\s]+/giu, '$1[redacted]')
    .replace(/(authorization\s*:\s*(?:bearer\s+)?)[^\s,]+/giu, '$1[redacted]')
    .replace(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/gu, '[redacted-private-key]')
    .replace(/\bAKIA[0-9A-Z]{16}\b/gu, '[redacted-aws-key]')
    .replace(/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/gu, '[redacted-jwt]')
    .replace(/\b(?:ssh-rsa|ssh-ed25519)\s+[A-Za-z0-9+/=]+(?:\s+\S+)?/gu, '[redacted-public-key]')
    .replace(/\b[A-F0-9]{32,}\b/giu, '[redacted-hex-secret]')
    .replace(
      /\b(?=[A-Za-z0-9+/]{32,}={0,2}\b)(?=[A-Za-z0-9+/]*[0-9])[A-Za-z0-9+/]{32,}={0,2}\b/gu,
      '[redacted-opaque-secret]',
    )
    .slice(0, MAX_TEST_OUTPUT);
