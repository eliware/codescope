import { readHandleUpToLimit } from "../../combine/read-file-up-to-limit.mjs";
import { TextDecoder } from "node:util";

export const MAX_ENVIRONMENT_FILE_BYTES = 100_000;

export async function readEnvironmentContent(handle) {
  const result = await readHandleUpToLimit(handle, MAX_ENVIRONMENT_FILE_BYTES);
  if (result.truncated)
    throw new Error(`environment file exceeds the ${MAX_ENVIRONMENT_FILE_BYTES}-byte read limit`);
  return new TextDecoder("utf-8", { fatal: true }).decode(result.data);
}
