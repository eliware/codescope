import {
  getProfileFiles,
  getSuggestionCategories,
  PROFILE_NAMES,
} from "../../src/profiles/profile-selection.mjs";

test("derives profile names and source selections from definitions", () => {
  expect(PROFILE_NAMES).toContain("all");
  expect(getProfileFiles("all")).toEqual([true, true, true]);
  expect(getProfileFiles("release")).toEqual([true, true, true]);
  expect(getSuggestionCategories("security")).toEqual(["security"]);
  expect(getSuggestionCategories("missing")).toBeUndefined();
  expect(() => getProfileFiles("missing")).toThrow("Unknown analysis profile");
});
