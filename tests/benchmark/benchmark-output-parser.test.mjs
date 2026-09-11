import { parseBenchmarkOutput } from '../../src/benchmark/benchmark-output-parser.mjs';

test('parses valid and rejects invalid benchmark output', () => {
  expect(parseBenchmarkOutput(' {"findings":{},"verdict":"pass"} ')).toEqual({
    findings: {},
    verdict: 'pass',
  });
  expect(parseBenchmarkOutput('{"verdict":"pass"}')).toBeUndefined();
  expect(parseBenchmarkOutput('not json')).toBeUndefined();
});
