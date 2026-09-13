import { collectReviewContext } from '../../src/review/collect-context.mjs';

test('delegates repository context collection as one phase', async () => {
  const combined = { source: 'context' };
  await expect(
    collectReviewContext({
      cwd: 'repo',
      combine: async () => combined,
      readDirectory: async () => [],
      readFile: async () => '',
      maxSourceChars: 10,
    }),
  ).resolves.toEqual({ combined });
});
