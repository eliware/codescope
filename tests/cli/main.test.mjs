import { main } from '../../src/cli/main.mjs';

test('main dispatches help without provider work', async () => {
  const output = [];
  await expect(main(['help'], { output: (value) => output.push(value) })).resolves.toBe(0);
  expect(output.join('')).toContain('## Owner workflow');
});
