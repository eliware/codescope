import {
  safeResponseSummary,
  serializeResponseDiagnostic,
} from '../../src/review/response-diagnostic.mjs';

test('extracts safe response summaries independently', () => {
  expect(safeResponseSummary({ output_text: 'partial' })).toEqual({ output_text: 'partial' });
});

test('returns an empty summary when response access throws', () => {
  const response = new Proxy({}, { get: () => { throw new Error('unreadable'); } });
  expect(safeResponseSummary(response)).toEqual({});
});

test('serializes and redacts a diagnostic independently', () => {
  expect(serializeResponseDiagnostic({ output_text: 'TOKEN=secret' }).response).toContain(
    'TOKEN=[REDACTED]',
  );
});

test('marks unserializable and non-serializable diagnostics as unavailable', () => {
  const circular = {};
  circular.self = circular;
  expect(serializeResponseDiagnostic(circular)).toBeUndefined();
  expect(serializeResponseDiagnostic(() => {})).toBeUndefined();
});

test('does not mark an exact diagnostic boundary as truncated', () => {
  const output = serializeResponseDiagnostic({ output_text: 'x'.repeat(499_982) });
  expect(output.response).toHaveLength(500_000);
  expect(output.response_truncated).toBeUndefined();
});
