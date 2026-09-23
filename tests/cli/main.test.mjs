import { main } from '../../src/cli/main.mjs';

test('dispatches a metadata command through the public CLI boundary', async () => {
  const output = [];
  await expect(main(['help'], { output: (value) => output.push(value) })).resolves.toBe(0);
  expect(output.join('')).toContain('## Owner workflow');
});

test('uses the process-boundary defaults for metadata dispatch', async () => {
  const originalLog = console.log;
  console.log = () => {};
  try {
    await expect(main(['help'])).resolves.toBe(0);
  } finally {
    console.log = originalLog;
  }
});

test('routes one profile command through review and returns its status', async () => {
  const calls = [];
  await expect(main(['all'], {
    review: async (_cwd, options) => {
      calls.push(options);
      return { verdict: 'pass' };
    },
    write: () => {},
  })).resolves.toBe(0);
  expect(calls).toHaveLength(1);
});

