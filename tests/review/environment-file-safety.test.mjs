import {
  assertNotSymbolicLink,
  assertRegularFile,
} from "../../src/review/environment-file-safety.mjs";

test("validates regular file metadata", () => {
  const metadata = { isSymbolicLink: () => false, isFile: () => true };
  expect(() => assertNotSymbolicLink(".env", metadata)).not.toThrow();
  expect(() => assertRegularFile(".env", metadata)).not.toThrow();
});

test("rejects missing and unsafe symbolic-link metadata", () => {
  expect(() => assertNotSymbolicLink(".env", {})).toThrow(/symbolic-link metadata/);
  expect(() => assertNotSymbolicLink(".env", { isSymbolicLink: () => true })).toThrow(
    /symbolic link/,
  );
  expect(() => assertRegularFile(".env", {})).toThrow(/regular-file metadata/);
  expect(() => assertRegularFile(".env", { isFile: () => false })).toThrow(/regular file/);
});
