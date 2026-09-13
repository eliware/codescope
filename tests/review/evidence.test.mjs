import { collectReviewEvidence } from '../../src/review/evidence.mjs';

test('assembles repository evidence through injected collaborators', async () => {
  const result = await collectReviewEvidence({
    cwd: '.',
    combine: async (_cwd, options) => ({ source: options.maxChars }),
    readDirectory: async () => [],
    readFile: async () => '',
    maxSourceChars: 10,
  });
  expect(result.combined).toEqual({ source: 10 });
});
