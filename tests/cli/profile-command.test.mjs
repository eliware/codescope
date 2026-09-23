import { runProfileCommand } from '../../src/cli/profile-command.mjs';

test('runs a profile and translates its options', async () => {
  const calls = [];
  await expect(
    runProfileCommand('analyze-all', {
      cwd: 'repo',
      write: () => {},
      review: async (_cwd, options) => {
        calls.push(options);
        return { verdict: 'pass' };
      },
      options: ['--usage'],
      effort: 'low',
    }),
  ).resolves.toBe(0);
  expect(calls[0]).toMatchObject({ usage: true });
});

test('uses empty raw options when omitted', async () => {
  let received;
  await expect(runProfileCommand('analyze-all', {
    cwd: 'repo',
    write: () => {},
    review: async (_cwd, options) => { received = options; },
  })).resolves.toBe(0);
  expect(received.usage).toBe(false);
});

test('maps new-features review commands to suggestion mode', async () => {
  let received;
  await expect(runProfileCommand('analyze-new-features', {
    cwd: 'repo',
    write: () => {},
    review: async (_cwd, options) => { received = options; },
  })).resolves.toBe(0);
  expect(received.prompt).toBeDefined();
});

test('returns success immediately for dry runs', async () => {
  await expect(runProfileCommand('analyze-all', {
    cwd: 'repo',
    dryRun: true,
    write: () => {},
    review: async () => {},
  })).resolves.toBe(0);
});
