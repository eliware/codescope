import { readConventionApplicability } from '../../../src/combine/convention/applicability.mjs';

test('resolves only package-selected directive records', async () => {
  await expect(readConventionApplicability('repo', {
    readPackageJson: async () => JSON.stringify({
      eliware: { apply: ['general', 'cli'] },
    }),
  })).resolves.toMatchObject({
    profiles: new Set(['general', 'cli']),
    canonicalPaths: new Map([['general', 'general.json'], ['cli', 'cli.json']]),
  });
});

test('marks eliware test as requiring all directive records', async () => {
  await expect(readConventionApplicability('repo', {
    readPackageJson: async () => JSON.stringify({
      name: '@eliware/test',
      eliware: { apply: ['general'] },
    }),
  })).resolves.toMatchObject({ includeAll: true });
});

test('returns unavailable for malformed applicability data', async () => {
  await expect(readConventionApplicability('repo', {
    readPackageJson: async () => JSON.stringify({ eliware: { apply: [1] } }),
  })).resolves.toBeNull();
});

test('uses the default reader and returns unavailable for a missing package', async () => {
  await expect(readConventionApplicability('missing')).resolves.toBeNull();
});
