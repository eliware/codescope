import { validateReviewOptions } from '../../src/review/options.mjs';

test('composes the review option validators for a valid configuration', () => {
  expect(() => validateReviewOptions('/repo', {
    maxSourceChars: 100,
    usage: false,
    dryRun: false,
    write: () => {},
    readFile: () => {},
    combine: () => {},
    createClient: () => {},
    register: () => {},
    platform: 'linux',
  })).not.toThrow();
});
