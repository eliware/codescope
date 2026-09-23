import { createDefaultWriter } from '../../cli/default-writer.mjs';

export function createOutputDefaults() {
  return { write: createDefaultWriter() };
}
