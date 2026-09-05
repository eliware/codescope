import {
  isValidUnifiedResult,
  parseUnifiedToolResponse,
} from '../../src/response/unified-parser.mjs';

const categories = ['correctness'];
const item = {
  severity: 'none',
  location: 'none',
  finding: 'No issues found.',
  recommendation: '',
  rationale: '',
  ignore_example: '// codescope ignore: no actionable finding',
};

test('validates a unified result', () => {
  const result = { findings: { correctness: [item] }, verdict: 'pass' };
  expect(isValidUnifiedResult(result, categories)).toBe(true);
  expect(isValidUnifiedResult({ ...result, verdict: 'unknown' }, categories)).toBe(false);
});

test('parses exactly one unified function call', () => {
  const response = {
    output: [
      {
        type: 'function_call',
        name: 'submit_unified_review',
        arguments: JSON.stringify({ findings: { correctness: [item] }, verdict: 'pass' }),
      },
    ],
  };
  expect(parseUnifiedToolResponse(response, categories)).toEqual({
    findings: { correctness: [item] },
    verdict: 'pass',
  });
});

test('rejects malformed unified categories and arguments', () => {
  const response = (value) => ({
    output: [
      { type: 'function_call', name: 'submit_unified_review', arguments: JSON.stringify(value) },
    ],
  });
  expect(() =>
    parseUnifiedToolResponse(response({ findings: {}, verdict: 'pass' }), categories),
  ).toThrow(/invalid result/);
  expect(() =>
    parseUnifiedToolResponse(
      response({ findings: { correctness: [null] }, verdict: 'pass' }),
      categories,
    ),
  ).toThrow(/invalid result/);
  expect(() =>
    parseUnifiedToolResponse(
      response({ findings: { correctness: [item] }, verdict: 'maybe' }),
      categories,
    ),
  ).toThrow(/invalid result/);
  expect(() =>
    parseUnifiedToolResponse(
      { output: [{ type: 'function_call', name: 'submit_unified_review', arguments: '{' }] },
      categories,
    ),
  ).toThrow(/invalid JSON/);
  expect(() => parseUnifiedToolResponse({ output: [] }, categories)).toThrow(/exactly one/);
  expect(() =>
    parseUnifiedToolResponse(
      response({ findings: { wrong: [item] }, verdict: 'pass' }),
      categories,
    ),
  ).toThrow(/invalid result/);
  expect(() =>
    parseUnifiedToolResponse(
      response({ findings: { correctness: {} }, verdict: 'pass' }),
      categories,
    ),
  ).toThrow(/invalid result/);
  expect(() =>
    parseUnifiedToolResponse(
      response({ findings: { correctness: [{ ...item, extra: true }] }, verdict: 'pass' }),
      categories,
    ),
  ).toThrow(/invalid result/);
  expect(() =>
    parseUnifiedToolResponse(
      response({ findings: { correctness: [{ ...item, severity: 'P9' }] }, verdict: 'pass' }),
      categories,
    ),
  ).toThrow(/invalid result/);
  expect(() =>
    parseUnifiedToolResponse(response({ findings: { correctness: [item] }, verdict: 'pass' }), []),
  ).toThrow(/invalid result/);
  expect(isValidUnifiedResult({ findings: { correctness: [] }, verdict: 'pass' }, categories)).toBe(
    false,
  );
  expect(isValidUnifiedResult({ findings: { wrong: [item] }, verdict: 'pass' }, categories)).toBe(
    false,
  );
  expect(() =>
    parseUnifiedToolResponse(response({ findings: { correctness: [item] }, verdict: 'pass' })),
  ).toThrow(/invalid result/);
});
