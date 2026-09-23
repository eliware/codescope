import { createSetupFailure } from '../../src/review/setup-failure.mjs';

test('creates a setup failure with the cause message', () => {
  expect(createSetupFailure(new Error('bad setup')).message).toBe('CodeScope setup failed: bad setup');
});

test('uses a safe message when the cause cannot be formatted', () => {
  const hostile = { [Symbol.toPrimitive]: () => { throw new Error('hostile'); } };
  expect(createSetupFailure(hostile).message).toBe('CodeScope setup failed: failure details unavailable');
});
