import { isIncludedContent } from "../../src/combine/other-policy.mjs";

test.each([
  "config.json",
  "docs/guide.json",
  "specs/directives.json",
  "examples/sample.json",
  "src/data.json",
  "outside/nested.json",
])("does not repeat JSON context in inventory: %s", (file) => {
  expect(isIncludedContent(file)).toBe(true);
});

test.each(["package-lock.json", "nested/package-lock.json"])(
  "retains package-lock JSON in inventory without supplying its contents: %s",
  (file) => {
    expect(isIncludedContent(file)).toBe(false);
  },
);

test.each(["workflow.yml", "nested/workflow.yaml", ".github/workflows/ci.yml"])(
  "does not repeat YAML context in inventory: %s",
  (file) => {
    expect(isIncludedContent(file)).toBe(true);
  },
);

test("recognizes included JSON paths with Windows separators", () => {
  expect(isIncludedContent("specs\\directives.json")).toBe(true);
});

test.each(["package.json", "README.md", ".github/workflows/ci.yml", ".knit/config.txt"])(
  "recognizes other selected context files: %s",
  (file) => {
    expect(isIncludedContent(file)).toBe(true);
  },
);

test.each(["src/main.js", "src/main.mjs", "src/main.cjs", "src/main.ts", "notes.txt"])(
  "recognizes implementation context and leaves unrelated files for inventory: %s",
  (file) => {
    expect(isIncludedContent(file)).toBe(file !== "notes.txt");
  },
);
