import { createDefaultWriter } from './default-writer.mjs';

export function createCliRuntimeDefaults() {
  return { output: console.log, error: console.error, write: createDefaultWriter() };
}
