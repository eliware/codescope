const MAX_TEST_OUTPUT = 500_000;

export const redactTestOutput = (value) =>
  String(value ?? '')
    .replace(/((?:api[_-]?key|token|password|secret)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s]+)/giu, '$1[redacted]')
    .replace(/((?:["']?(?:api[_-]?key|token|password|secret)["']?\s*:\s*))(?:"[^"]*"|'[^']*'|[^\s,}]+)/giu, '$1[redacted]')
    .replace(/((?:[A-Z][A-Z0-9_]{2,})\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s]+)/gu, '$1[redacted]')
    .replace(/\b(?:sk|ghp|github_pat|xoxb)-[A-Za-z0-9_-]+/gu, '[redacted]')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+/giu, 'Bearer [redacted]')
    .replace(/([?&](?:api[_-]?key|token|password|secret)=)[^&#\s]+/giu, '$1[redacted]')
    .replace(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/gu, '[redacted-private-key]')
    .replace(/\bAKIA[0-9A-Z]{16}\b/gu, '[redacted-aws-key]')
    .replace(/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/gu, '[redacted-jwt]')
    .slice(0, MAX_TEST_OUTPUT);
