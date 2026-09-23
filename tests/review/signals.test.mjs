import { registerReviewSignals } from '../../src/review/signals.mjs';

test('registers a shutdown hook that aborts the controller', () => {
  const controller = new AbortController();
  let options;
  registerReviewSignals((value) => {
    options = value;
    return {};
  }, controller);
  expect(options.exit).toBe(false);
  options.shutdownHook('SIGINT');
  expect(controller.signal.aborted).toBe(true);
  expect(controller.signal.reason.code).toBe('SIGINT');
});

test('records termination signal identity on the abort reason', () => {
  const controller = new AbortController();
  let options;
  registerReviewSignals((value) => {
    options = value;
    return {};
  }, controller);
  options.shutdownHook('SIGTERM');
  expect(controller.signal.reason.code).toBe('SIGTERM');
});

test('wraps signal registration failures', () => {
  expect(() =>
    registerReviewSignals(() => {
      throw new Error('signal failure');
    }, new AbortController()),
  ).toThrow('Unable to register signal handlers');
});

test('formats non-error signal registration failures', () => {
  expect(() =>
    registerReviewSignals(() => {
      throw 'failed';
    }, new AbortController()),
  ).toThrow(/failed/);
});
