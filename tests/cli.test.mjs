import * as cli from '../src/cli.mjs';
test('public CLI barrel exports its contract', () => {
  expect(typeof cli.main).toBe('function');
  expect(typeof cli.parseArgs).toBe('function');
  expect(typeof cli.usage).toBe('function');
});
