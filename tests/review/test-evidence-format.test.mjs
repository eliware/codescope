import { formatTestEvidence, formatTestFailure } from '../../src/review/test-evidence-format.mjs';

test('formats pass and failure evidence', () => {
  expect(
    formatTestEvidence(
      { stdout: 'ok', stderr: '', code: 0 },
      false,
      (v) => v,
      (v) => v,
      (v) => v.code,
    ),
  ).toContain('status: pass');
  expect(formatTestFailure({ code: 2, stdout: 'bad', stderr: '' }, 1000, (v) => v)).toContain(
    'runner failure',
  );
});

test('labels an unknown execution code as unknown', () => {
  expect(
    formatTestEvidence(
      { stdout: '', stderr: '', code: null },
      false,
      (v) => v,
      (v) => v,
      () => 'unknown',
    ),
  ).toContain('status: unknown');
});
