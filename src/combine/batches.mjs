import { addBatchLength, assertWithinLimit } from './limits.mjs';

export async function readBatches(files, { batchSize, maxChars, read }) {
  const sections = [];
  let totalChars = 0;
  for (let start = 0; start < files.length; start += batchSize) {
    const batch = await Promise.all(files.slice(start, start + batchSize).map(read));
    totalChars = addBatchLength(
      totalChars,
      batch.reduce((total, section) => total + section.length, 0),
      batch.length,
    );
    assertWithinLimit(totalChars, maxChars);
    sections.push(...batch);
  }
  return sections;
}
