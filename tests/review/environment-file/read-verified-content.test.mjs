import { readVerifiedEnvironmentContent } from "../../../src/review/environment-file/read-verified-content.mjs";

const metadata = (overrides = {}) => ({
  dev: 1,
  ino: 2,
  size: 20n,
  mtimeNs: 3n,
  ctimeNs: 4n,
  isSymbolicLink: () => false,
  isFile: () => true,
  ...overrides,
});

test("checks file kind and identity before reading the content", async () => {
  let readEncoding;
  const readFile = async (encoding) => {
    readEncoding = encoding;
    return "OPENAI_API_TOKEN=token";
  };
  const handle = { stat: async () => metadata(), readFile };

  await expect(readVerifiedEnvironmentContent(".env", handle, "1:2")).resolves.toBe(
    "OPENAI_API_TOKEN=token",
  );
  expect(readEncoding).toBe("utf8");
});

test("rejects unsafe, replaced, and unreadable files", async () => {
  await expect(
    readVerifiedEnvironmentContent(
      ".env",
      { stat: async () => metadata({ isSymbolicLink: () => true }) },
      "1:2",
    ),
  ).rejects.toThrow(/symbolic link/);
  await expect(
    readVerifiedEnvironmentContent(
      ".env",
      { stat: async () => metadata({ isFile: () => false }) },
      "1:2",
    ),
  ).rejects.toThrow(/regular file/);
  await expect(
    readVerifiedEnvironmentContent(".env", { stat: async () => metadata({ ino: 3 }) }, "1:2"),
  ).rejects.toThrow(/replaced/);
  await expect(
    readVerifiedEnvironmentContent(
      ".env",
      {
        stat: async () => metadata(),
        readFile: async () => {
          throw new Error("read failed");
        },
      },
      "1:2",
    ),
  ).rejects.toThrow("read failed");
});

test("rejects an in-place change while reading the open file", async () => {
  const versions = [metadata(), metadata({ ctimeNs: 5n })];
  const handle = {
    stat: async () => versions.shift(),
    readFile: async () => "OPENAI_API_TOKEN=changed",
  };

  await expect(readVerifiedEnvironmentContent(".env", handle, "1:2")).rejects.toThrow(
    /changed while it was being read/,
  );
});
