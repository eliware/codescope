import { collectReviewEvidence } from '../../src/review/evidence.mjs';

test('assembles repository evidence through injected collaborators', async () => {
  const result = await collectReviewEvidence({
    cwd: '.',
    combine: async (_cwd, options) => ({ source: options.maxChars, platform: options.platform }),
    readDirectory: async () => [],
    readFile: async () => '',
    maxSourceChars: 10,
    platform: 'win32',
  });
  expect(result.combined).toEqual({ source: 10, platform: 'win32' });
});
