import { readBoundedConfigSource } from "../read/bounded-config-source.mjs";
import { validateConfigSource } from "../validate-config-source.mjs";

export { MAX_CONFIG_BYTES } from "../read/bounded-config-source.mjs";

export async function readConfigSource(
  root,
  relativePath,
  { readFileContents, inspectFile, openFile, platform = process.platform } = {},
) {
  const filePath = await validateConfigSource(root, relativePath, { inspectFile, platform });
  return readBoundedConfigSource(filePath, { readFileContents, openFile });
}
