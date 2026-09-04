const MAX_TEST_OUTPUT = 500_000;

const SECRET_VALUE = '(?:"[^"]*"|\'[^\']*\'|[^\\s,};&]+)';
const SECRET_NAME =
  '(?:api[_-]?key|access[_-]?key|client[_-]?secret|credential|password|passwd|secret|token)';

const REDACTION_RULES = [
  [new RegExp(`((?:${SECRET_NAME})\\s*[=:]\\s*)${SECRET_VALUE}`, 'giu'), '$1[redacted]'],
  [new RegExp(`(["']?${SECRET_NAME}["']?\\s*:\\s*)${SECRET_VALUE}`, 'giu'), '$1[redacted]'],
  [/((?:[A-Z][A-Z0-9_]{2,})\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s,};&]+)/gu, '$1[redacted]'],
  [/([?&](?:api[_-]?key|token|password|secret)=)[^&#\s]+/giu, '$1[redacted]'],
  [/(authorization\s*:\s*(?:bearer\s+)?)[^\s,]+/giu, '$1[redacted]'],
  [/(\bBearer\s+)[A-Za-z0-9._~+/=-]+/giu, '$1[redacted]'],
  [/\b(?:sk|ghp|github_pat|xox[baprs])-[A-Za-z0-9_-]+/gu, '[redacted-token]'],
  [/\b(?:npm_[A-Za-z0-9]{20,}|pypi-[A-Za-z0-9_-]{20,})\b/gu, '[redacted-token]'],
  [/\bAIza[0-9A-Za-z_-]{20,}\b/gu, '[redacted-google-key]'],
  [/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/gu, '[redacted-private-key]'],
  [/\bAKIA[0-9A-Z]{16}\b/gu, '[redacted-aws-key]'],
  [/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/gu, '[redacted-jwt]'],
  [/\b(?:ssh-rsa|ssh-ed25519)\s+[A-Za-z0-9+/=]+(?:\s+\S+)?/gu, '[redacted-public-key]'],
  [/\b[A-F0-9]{32,}\b/giu, '[redacted-hex-secret]'],
  [
    /\b(?=[A-Za-z0-9+/]{32,}={0,2}\b)(?=[A-Za-z0-9+/]*[0-9])[A-Za-z0-9+/]{32,}={0,2}\b/gu,
    '[redacted-opaque-secret]',
  ],
];

export const redactTestOutput = (value) => {
  let output = String(value ?? '');
  for (const [pattern, replacement] of REDACTION_RULES)
    output = output.replace(pattern, replacement);
  return output.slice(0, MAX_TEST_OUTPUT);
};
