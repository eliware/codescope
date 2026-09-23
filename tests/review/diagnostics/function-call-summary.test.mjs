import { readFunctionCallArguments } from '../../../src/review/diagnostics/function-call-summary.mjs';

test('preserves valid calls when another call is malformed', () => {
  const calls = readFunctionCallArguments({ output: [
    { type: 'function_call', name: 'ok', arguments: '{}' },
    { type: 'function_call', name: 'bad', get arguments() { throw new Error('bad'); } },
  ] });
  expect(calls).toEqual([{ name: 'ok', arguments: '{}' }]);
});

test('returns no calls when output has no function calls', () => {
  expect(readFunctionCallArguments({ output: [{ type: 'message' }] })).toBeUndefined();
});

test('skips calls with unusable names or arguments', () => {
  const hostileName = {};
  Object.defineProperty(hostileName, 'toJSON', { value: () => { throw new Error('bad name'); } });
  expect(readFunctionCallArguments({ output: [
    { type: 'function_call', name: {}, arguments: {} },
    { type: 'function_call', name: Symbol('unserializable'), arguments: '{}' },
    { type: 'function_call', name: 'missing', arguments: undefined },
    { type: 'function_call', name: hostileName, arguments: '{}' },
  ] })).toEqual([{ name: '{}', arguments: '{}' }]);
});
