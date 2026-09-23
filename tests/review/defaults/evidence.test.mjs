import { createEvidenceDefaults } from '../../../src/review/defaults/evidence.mjs';

test('creates evidence defaults', () => {
  expect(createEvidenceDefaults()).toMatchObject({ combine: expect.any(Function), inspectFile: expect.any(Function) });
});
