import {
  frameCustomPrompt,
  frameRepositoryContent,
  frameReviewContent,
  frameReviewInstructions,
} from "../../../src/review/request/content-boundary.mjs";

test("frames supplied content and instructions", () => {
  const repository = frameRepositoryContent("source");
  expect(frameReviewContent(repository)).toContain("--- BEGIN REVIEW CONTENT ---");
  expect(frameReviewInstructions("check source")).toContain("check source");
  expect(frameCustomPrompt(repository, "custom")).toContain("\n\ncustom");
});
