import { fileIdentity } from "../../src/review/environment-file-identity.mjs";

test("normalizes numeric and bigint file identity components consistently", () => {
  expect(fileIdentity("file", { dev: 1n, ino: 2n })).toBe("1:2");
  expect(fileIdentity("file", { dev: 1, ino: 2 })).toBe("1:2");
});

test("keeps unsafe numeric identities explicit and rejects invalid metadata", () => {
  expect(fileIdentity("file", { dev: Number.MAX_SAFE_INTEGER + 2, ino: 2 })).toContain("number:");
  expect(() => fileIdentity("file")).toThrow(/stable file identity/);
  expect(() => fileIdentity("file", { dev: 1, ino: "2" })).toThrow(/stable file identity/);
});
