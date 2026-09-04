import { parseToolArguments } from '../../src/response/tool-parser.mjs';

test('parses one function call and reports malformed arguments', () => {
  expect(
    parseToolArguments({ output: [{ type: 'function_call', name: 'x', arguments: '{}' }] }, 'x'),
  ).toEqual({});
  expect(() => parseToolArguments({ output: [] }, 'x')).toThrow(/exactly one/);
  expect(() =>
    parseToolArguments({ output: [{ type: 'function_call', name: 'x', arguments: '{' }] }, 'x'),
  ).toThrow(/valid JSON/);
});
