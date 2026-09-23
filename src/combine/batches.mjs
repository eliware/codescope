import { addBatchLength, assertWithinLimit } from './limits.mjs';

export async function readBatches(files, { batchSize, maxChars, read }) {
  if (!Number.isInteger(batchSize) || batchSize < 1)
    throw new Error('Batch size must be a positive integer');
  const sections = Array(files.length);
  let totalChars = 0;
  let nextIndex = 0;
  let failed = false;
  let firstError;
  async function worker() {
    while (!failed && nextIndex < files.length) {
      const index = nextIndex++;
      let section;
      try { section = await read(files[index]); } catch (error) {
        failed = true;
        firstError ??= error;
        throw error;
      }
      totalChars = addBatchLength(totalChars, section.length, 1);
      try {
        assertWithinLimit(totalChars, maxChars);
      } catch (cause) {
        failed = true;
        throw cause;
      }
      sections[index] = section;
    }
  }
  const results = await Promise.allSettled(Array.from(
    { length: Math.min(batchSize, files.length) },
    worker,
  ));
  if (firstError) throw firstError;
  const rejection = results.find((result) => result.status === 'rejected');
  if (rejection) throw rejection.reason;
  return sections;
}
