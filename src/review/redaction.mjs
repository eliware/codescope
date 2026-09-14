import { redactText } from '@eliware/redact';

const CODE_SCOPE_MAX_OUTPUT = 500_000;

export const redactTestOutput = (value) =>
  redactText(value, {
    maxString: CODE_SCOPE_MAX_OUTPUT,
  });

export function redactDiagnostic(value) {
  const text = typeof value === 'string' ? value : String(value ?? '');
  return {
    text: redactTestOutput(text),
    truncated: text.length > CODE_SCOPE_MAX_OUTPUT,
  };
}
