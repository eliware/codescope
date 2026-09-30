import { readEnvironmentContent } from "../../../src/review/environment-file/read-content.mjs";

test("returns the environment-file content from the reader", async () => {
  const handle = { readFile: async (encoding) => `${encoding}: content` };
  await expect(readEnvironmentContent(handle)).resolves.toBe("utf8: content");
});
