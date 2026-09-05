import { finalizeReviewSession } from '../../src/review/finalize-session.mjs';

test('executes with registered signals and always finalizes them', async () => {
  const controller = new AbortController();
  let removed = false;
  const result = await finalizeReviewSession({
    controller,
    register: (options) => {
      expect(options.signal).toBe(controller.signal);
      return { removeHandlers: () => (removed = true) };
    },
    execute: async (signal) => {
      expect(signal).toBe(controller.signal);
      return 'result';
    },
  });
  expect(result).toBe('result');
  expect(controller.signal.aborted).toBe(true);
  expect(removed).toBe(true);
});

test('finalizes before propagating execution failures', async () => {
  const controller = new AbortController();
  let removed = false;
  await expect(
    finalizeReviewSession({
      controller,
      register: () => ({ removeHandlers: () => (removed = true) }),
      execute: async () => {
        throw new Error('provider failed');
      },
    }),
  ).rejects.toThrow('provider failed');
  expect(controller.signal.aborted).toBe(true);
  expect(removed).toBe(true);
});
