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

test('reports malformed applicability data as invalid', async () => {
  await expect(readConventionApplicability('repo', {
    readPackageJson: async () => JSON.stringify({ eliware: { apply: [1] } }),
  })).resolves.toMatchObject({
    kind: 'invalid',
    reason: 'package.json eliware.apply must be an array of strings',
  });
});

test('reports malformed package JSON and unexpected read failures as invalid', async () => {
  await expect(readConventionApplicability('repo', {
    readPackageJson: async () => '{',
  })).resolves.toMatchObject({ kind: 'invalid', reason: 'package.json is not valid JSON' });
  await expect(readConventionApplicability('repo', {
    readPackageJson: async () => '[]',
  })).resolves.toMatchObject({ kind: 'invalid', reason: 'package.json must contain an object' });
  await expect(readConventionApplicability('repo', {
    readPackageJson: async () => { throw new Error('permission denied'); },
  })).resolves.toMatchObject({ kind: 'invalid', reason: 'package.json could not be read' });
});

test('uses the default reader and returns unavailable for a missing package', async () => {
  await expect(readConventionApplicability('missing')).resolves.toBeNull();
});
