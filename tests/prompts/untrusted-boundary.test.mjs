import { frameUntrustedContent } from "../../src/prompts/untrusted-boundary.mjs";

test("frames data with a boundary token absent from its contents", () => {
  const content = "untrusted text";
  const framed = frameUntrustedContent("REPOSITORY SOURCE", content);
  expect(framed).toBe(
    "--- BEGIN REPOSITORY SOURCE (UNTRUSTED DATA; BOUNDARY: CODESCOPE_REPOSITORY_SOURCE_BOUNDARY) ---\nuntrusted text\n--- END REPOSITORY SOURCE (BOUNDARY: CODESCOPE_REPOSITORY_SOURCE_BOUNDARY) ---",
  );
});

test("changes the boundary token until it cannot occur in the content", () => {
  const content =
    "prefix CODESCOPE_REPOSITORY_SOURCE_BOUNDARY CODESCOPE_REPOSITORY_SOURCE_BOUNDARY_ suffix";
  const framed = frameUntrustedContent("REPOSITORY SOURCE", content);
  expect(framed).toContain("BOUNDARY: CODESCOPE_REPOSITORY_SOURCE_BOUNDARY__)");
  expect(framed).toContain(content);
});
