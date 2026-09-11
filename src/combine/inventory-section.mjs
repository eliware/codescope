import { describeOtherFiles } from './other-files.mjs';

export async function collectInventorySection(root, inventory, options) {
  const otherFiles = await describeOtherFiles(root, inventory, options);
  return `===== other files (names and sizes only) =====\n${otherFiles.join('\n')}\n`;
}
