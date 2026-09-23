import { readBatches } from './batches.mjs';
import { readConfigEntry } from './config/read-config-entry.mjs';
import { isAbsolutePortablePath, selectConfigFiles } from './config/paths.mjs';
import { validateScanRoot } from '../find/root-policy.mjs';

export async function combineConfigFiles(
  root,
  { inventory, readFileContents, inspectFile, concurrency = 8, platform = process.platform } = {},
) {
  validateScanRoot(root, platform);
  const portableInventory = inventory.map((relativePath) => relativePath.replaceAll('\\', '/'));
  for (const relativePath of portableInventory)
    if (isAbsolutePortablePath(relativePath))
      throw new Error(`Configuration path escapes review root: ${relativePath}`);
  const configFiles = selectConfigFiles(portableInventory);
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('Configuration concurrency must be a positive integer');
  const sections = await readBatches(configFiles, {
    batchSize: concurrency,
    maxChars: Infinity,
    read: async (relativePath) => {
      return readConfigEntry(root, relativePath, { readFileContents, inspectFile, platform });
    },
  });
  const included = sections.filter(Boolean);
  return included.length ? `===== repository configuration =====\n${included.join('\n')}` : '';
}
