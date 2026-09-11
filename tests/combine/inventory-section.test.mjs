import { collectInventorySection } from '../../src/combine/inventory-section.mjs';

test('formats the inventory section', async () => {
  await expect(collectInventorySection('repo', [], {})).resolves.toContain('other files');
});
