import { assertCompleteWrite } from '../../../src/review/output/validate-write-result.mjs';

test('accepts an exact writer result', () => {
  expect(() => assertCompleteWrite({ written: 3 }, 'abc')).not.toThrow();
});

test('rejects invalid character counts', () => {
  expect(() => assertCompleteWrite({ written: -1 }, 'abc')).toThrow(/invalid written/);
  expect(() => assertCompleteWrite({ written: 1.5 }, 'abc')).toThrow(/invalid written/);
});

test('rejects short writes', () => {
  expect(() => assertCompleteWrite({ written: 2 }, 'abc')).toThrow(/short write/);
});

test('rejects unsupported writer results', () => {
  expect(() => assertCompleteWrite(undefined, 'abc')).toThrow(/unsupported result/);
  expect(() => assertCompleteWrite({}, 'abc')).toThrow(/unsupported result/);
});
