import { readConventionRecords } from '../../../src/combine/convention/read-records.mjs';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

test('reads and formats selected convention records', async () => {
  await expect(readConventionRecords('C:\\conventions\\specs', ['general.json'], {
    platform: 'win32',
    readFileContents: async () => '{"id":"general"}',
    inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
  })).resolves.toEqual(['===== conventions/specs/general.json =====\n1 {"id":"general"}\n']);
});

test('reads records with the host path policy', async () => {
  await expect(readConventionRecords('/conventions/specs', ['nested/general.json'], {
    readFileContents: async () => '{}',
    inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
  })).resolves.toHaveLength(1);
});

test('uses default reader options for a real convention record', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'codescope-records-'));
  try {
    await mkdir(path.join(root, 'nested'));
    await writeFile(path.join(root, 'nested', 'general.json'), '{}');
    await expect(readConventionRecords(root, ['nested/general.json'])).resolves.toHaveLength(1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
