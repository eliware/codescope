import { addBatchLength, assertWithinLimit } from './limits.mjs';

export async function readBatches(files, { batchSize, maxChars, read }) {
  const sections = Array(files.length);
  let totalChars = 0;
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < files.length) {
      const index = nextIndex++;
      const section = await read(files[index]);
      totalChars = addBatchLength(totalChars, section.length, 1);
      assertWithinLimit(totalChars, maxChars);
      sections[index] = section;
    }
  }
  await Promise.all(Array.from(
    { length: Math.min(batchSize, files.length) },
    worker,
  ));
  return sections;
}
