import { serializeResponseDiagnostic } from '../../../src/review/diagnostics/serialize-response-diagnostic.mjs';

test('serializes a provider diagnostic', () => {
  expect(serializeResponseDiagnostic({ error: 'ok' })).toEqual({ response: '{"error":"ok"}' });
});

test('returns no diagnostic when serialization fails', () => {
  expect(serializeResponseDiagnostic({ value: 1n })).toBeUndefined();
});

test('returns no diagnostic when JSON serialization is undefined', () => {
  expect(serializeResponseDiagnostic(undefined)).toBeUndefined();
});

test('marks oversized diagnostics as truncated', () => {
  const diagnostic = serializeResponseDiagnostic('x'.repeat(500_001));
  expect(diagnostic.response_truncated).toBe(true);
});
