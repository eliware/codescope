import { readConfigSource } from "./read-config-source.mjs";
import { readConfigSample } from "./read-config-sample.mjs";
import { formatConfigSection } from "./format-config-section.mjs";

export async function readConfigEntry(root, relativePath, options = {}) {
  const source = await readConfigSource(root, relativePath, options);
  const sample = readConfigSample(source, {
    readerProvided: Boolean(options.readFileContents),
    relativePath,
  });
  return sample.binary ? "" : formatConfigSection(relativePath, sample);
}
