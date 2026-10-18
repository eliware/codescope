import { REVIEW_CATEGORIES, SUGGESTION_CATEGORIES } from "../../src/profiles/categories.mjs";

test("defines review and suggestion categories", () => {
  expect(REVIEW_CATEGORIES).toContain("conventions");
  expect(SUGGESTION_CATEGORIES).toContain("new-features");
  expect(REVIEW_CATEGORIES).not.toContain("new-features");
});
