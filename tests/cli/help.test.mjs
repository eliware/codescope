import { usage } from '../../src/cli/help.mjs';

test('renders the owner workflow', () => {
  expect(usage()).toContain('## Owner workflow');
  expect(usage()).toContain('Run `codescope all` exactly once');
});
