import { isSafeProfileName } from "../../../src/combine/test-specs/is-safe-profile-name.mjs";

test("accepts lowercase single-segment profile names", () => {
  expect(isSafeProfileName("general")).toBe(true);
  expect(isSafeProfileName("npm-published")).toBe(true);
});

test("rejects paths and malformed names", () => {
  for (const name of ["../general", "General", "one--two", "one/child", ""]) {
    expect(isSafeProfileName(name)).toBe(false);
  }
  expect(isSafeProfileName(4)).toBe(false);
});
