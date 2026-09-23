import { readConventionApplicability } from '../../../src/combine/convention/applicability.mjs';

test('includes every convention for the eliware test package', async () => {
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions',
    readPackageJson: async () => JSON.stringify({ name: '@eliware/test' }),
    readFileContents: async () => '',
    readConventionManifest: async () => '',
    platform: 'posix',
  })).resolves.toMatchObject({ includeAll: true });
});

test('resolves applied convention paths from the manifest', async () => {
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions',
    readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
    readConventionManifest: async () => JSON.stringify({
      repositoryTypes: { general: 'C:/conventions/specs/general.json' },
    }),
  })).resolves.toMatchObject({
    includeAll: false,
    canonicalPaths: new Map([['general', 'general.json']]),
  });
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions',
    platform: 'win32',
    readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
    readFileContents: async () => JSON.stringify({ repositoryTypes: { general: 'general.json' } }),
  })).resolves.toMatchObject({ includeAll: false });
});

test('returns unavailable for malformed or incomplete applicability data', async () => {
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions',
    readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: [1] } } }),
  })).resolves.toBeNull();
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions',
    readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: ['missing'] } } }),
    readConventionManifest: async () => JSON.stringify({ repositoryTypes: {} }),
  })).resolves.toBeNull();
});

test('uses default readers and returns unavailable when options are omitted', async () => {
  await expect(readConventionApplicability('missing')).resolves.toBeNull();
});
