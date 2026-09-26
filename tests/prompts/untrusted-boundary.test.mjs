import { frameUntrustedContent } from "../../src/prompts/untrusted-boundary.mjs";

test("frames data with a boundary token absent from its contents", () => {
  const content = "untrusted text";
  const framed = frameUntrustedContent("REPOSITORY SOURCE", content);
  expect(framed).toBe(
    "--- BEGIN REPOSITORY SOURCE (UNTRUSTED DATA; BOUNDARY: CODESCOPE_REPOSITORY_SOURCE_BOUNDARY) ---\nuntrusted text\n--- END REPOSITORY SOURCE (BOUNDARY: CODESCOPE_REPOSITORY_SOURCE_BOUNDARY) ---",
  );
});

test.each(["1", "x", "!"])("changes the boundary when the token is followed by %s", (suffix) => {
  const base = "CODESCOPE_REPOSITORY_SOURCE_BOUNDARY";
  const content = `prefix ${base}${suffix} suffix`;
  const framed = frameUntrustedContent("REPOSITORY SOURCE", content);

  expect(framed).toContain(`BOUNDARY: ${base}_)`);
  expect(content).not.toContain(`${base}_`);
  expect(framed).toContain(content);
});

test("keeps extending the boundary until the complete token is absent", () => {
  const base = "CODESCOPE_REPOSITORY_SOURCE_BOUNDARY";
  const content = `prefix ${base}1 ${base}_ suffix`;
  const framed = frameUntrustedContent("REPOSITORY SOURCE", content);

  expect(framed).toContain(`BOUNDARY: ${base}__)`);
  expect(content).not.toContain(`${base}__`);
  expect(framed).toContain(content);
});
