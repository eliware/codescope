import { readAddition } from '../../../src/cli/options/read-addition.mjs';

test('reads a nonblank addition value', () => {
  expect(readAddition(['--add', 'note'], 0)).toEqual({ value: 'note', nextIndex: 1 });
});
