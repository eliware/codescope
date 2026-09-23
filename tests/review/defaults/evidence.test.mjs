import { createEvidenceDefaults } from '../../../src/review/defaults/evidence.mjs';

test('creates evidence defaults', () => {
  expect(createEvidenceDefaults()).toMatchObject({ combine: expect.any(Function), inspectFile: expect.any(Function) });
});

test('default evidence combiner selects JavaScript modules', async () => {
  const { combine } = createEvidenceDefaults();
  await expect(combine('/repo', { readDirectory: async () => [] })).resolves.toBe('');
});
