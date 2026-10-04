import {
  MAX_ENVIRONMENT_FILE_BYTES,
  readEnvironmentContent,
} from "../../../src/review/environment-file/read-content.mjs";
import { createEnvironmentReader } from "../../../test-fixtures/environment-file-handle.mjs";

test("returns the environment-file content from the reader", async () => {
  const handle = { read: createEnvironmentReader("utf8: content") };
  await expect(readEnvironmentContent(handle)).resolves.toBe("utf8: content");
});

test("strips a UTF-8 BOM before parsing environment content", async () => {
  const bytes = Buffer.concat([
    Buffer.from([0xef, 0xbb, 0xbf]),
    Buffer.from("OPENAI_API_TOKEN=token"),
  ]);
  const handle = { read: createEnvironmentReader(bytes) };
  await expect(readEnvironmentContent(handle)).resolves.toBe("OPENAI_API_TOKEN=token");
});

test("rejects an environment file that exceeds its byte limit", async () => {
  const handle = { read: createEnvironmentReader("x".repeat(MAX_ENVIRONMENT_FILE_BYTES + 1)) };
  await expect(readEnvironmentContent(handle)).rejects.toThrow(/100000-byte read limit/);
});

test("rejects malformed UTF-8 environment content", async () => {
  const handle = { read: createEnvironmentReader(Buffer.from([0xff])) };
  await expect(readEnvironmentContent(handle)).rejects.toThrow(/encoded data/);
});
