import { toolCategories, validIgnore } from '../../src/response/validation-shared.mjs';

test('provides shared validation helpers', () => {
  expect(
    toolCategories(
      { tools: [{ parameters: { properties: { issues: { properties: { security: {} } } } } }] },
      'issues',
    ),
  ).toEqual(['security']);
  expect(validIgnore('// codescope ignore: intentional')).toBe(true);
});
