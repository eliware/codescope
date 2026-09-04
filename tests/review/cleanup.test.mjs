import { removeSignalHandlers } from '../../src/review/cleanup.mjs';

test('removes registered handlers when available and tolerates absent handlers', () => {
  let removed = false;
  removeSignalHandlers({
    removeHandlers: () => {
      removed = true;
    },
  });
  removeSignalHandlers(undefined);
  removeSignalHandlers({ removeHandlers: null });
  removeSignalHandlers({
    removeHandlers: () => {
      throw new Error('already removed');
    },
  });
  expect(removed).toBe(true);
});
