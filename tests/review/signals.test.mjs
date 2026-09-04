import { registerReviewSignals } from '../../src/review/signals.mjs';

test('registers a shutdown hook that aborts the controller', () => {
  const controller = new AbortController();
  let options;
  registerReviewSignals((value) => { options = value; return {}; }, controller);
  expect(options.exit).toBe(false);
  options.shutdownHook();
  expect(controller.signal.aborted).toBe(true);
});

test('wraps signal registration failures', () => {
  expect(() => registerReviewSignals(() => { throw new Error('signal failure'); }, new AbortController())).toThrow('Unable to register signal handlers');
});
