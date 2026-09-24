import { lstat, open } from "node:fs/promises";
import { readHandleUpToLimit } from "../read-file-up-to-limit.mjs";
import { resolveConfigPath } from "./paths.mjs";

const MAX_CONFIG_LINES = 200;
const MAX_CONFIG_BYTES = 100_000;

export async function readConfigEntry(
  root,
  relativePath,
  { readFileContents, inspectFile, openFile = open, platform = process.platform } = {},
) {
  const filePath = resolveConfigPath(root, relativePath, platform);
  const metadata = await (inspectFile ?? lstat)(filePath);
  if (metadata.isSymbolicLink())
    throw new Error(`symlinked configuration files are not supported: ${relativePath}`);
  if (!metadata.isFile())
    throw new Error(`configuration path is not a regular file: ${relativePath}`);
  const bounded = readFileContents
    ? await readFileContents(filePath)
    : await readInspectedConfigFile(filePath, metadata, openFile);
  if (
    bounded &&
    typeof bounded === "object" &&
    !Buffer.isBuffer(bounded) &&
    (!Object.hasOwn(bounded, "data") || typeof bounded.truncated !== "boolean")
  )
    throw new Error("Configuration reader must return text, bytes, or { data, truncated }");
  const source =
    bounded && typeof bounded === "object" && "data" in bounded ? bounded.data : bounded;
  if (typeof source !== "string" && !Buffer.isBuffer(source))
    throw new Error("Configuration reader data must be text or bytes");
  const bytes = Buffer.isBuffer(source) ? source : Buffer.from(String(source));
  if (readFileContents && bytes.byteLength > MAX_CONFIG_BYTES && bounded?.truncated !== true)
    throw new Error(`Configuration reader exceeded the ${MAX_CONFIG_BYTES}-byte sample boundary`);
  if (bytes.byteLength > MAX_CONFIG_BYTES + 1)
    throw new Error(
      `Configuration reader exceeded the ${MAX_CONFIG_BYTES + 1}-byte sample boundary`,
    );
  if (bytes.includes(0)) return "";
  const byteTruncated = bytes.byteLength > MAX_CONFIG_BYTES || bounded?.truncated === true;
  const lines = bytes
    .subarray(0, MAX_CONFIG_BYTES)
    .toString("utf8")
    .split(/\r\n|\r|\n/u);
  // codescope ignore: remove the final-newline split artifact before applying the line limit.
  while (lines.at(-1) === "") lines.pop();
  const lineTruncated = lines.length > MAX_CONFIG_LINES;
  const visibleLines = lines.slice(0, MAX_CONFIG_LINES);
  const width = String(visibleLines.length).length;
  const body = visibleLines.map(
    (line, index) => `${String(index + 1).padStart(width, " ")} ${line}`,
  );
  if (byteTruncated || lineTruncated)
    body.push(
      byteTruncated && !lineTruncated
        ? "[truncated after the per-file byte limit; remaining config omitted]"
        : `[truncated after ${MAX_CONFIG_LINES} lines; remaining config omitted]`,
    );
  return `===== ${relativePath} =====\n${body.join("\n")}\n`;
}

async function readInspectedConfigFile(filePath, inspectedMetadata, openFile) {
  const handle = await openFile(filePath, "r");
  try {
    const openedMetadata = await handle.stat({ bigint: true });
    if (!openedMetadata.isFile()) throw new Error("configuration path is not a regular file");
    if (
      BigInt(inspectedMetadata.dev) !== openedMetadata.dev ||
      BigInt(inspectedMetadata.ino) !== openedMetadata.ino
    )
      throw new Error("configuration file changed while opening");
    return await readHandleUpToLimit(handle, MAX_CONFIG_BYTES);
  } finally {
    await handle.close();
  }
}

export { MAX_CONFIG_BYTES, MAX_CONFIG_LINES };
