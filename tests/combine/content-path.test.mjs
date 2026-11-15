import { isGeneratedArtifactPath } from "../../src/combine/content-path.mjs";

test.each([
  "dist/bundle.js",
  "nested/dist/data.json",
  "artifacts/output.yaml",
  "nested/ARTIFACTS/README.md",
  "dist\\nested\\module.ts",
])("identifies generated artifact paths: %s", (file) => {
  expect(isGeneratedArtifactPath(file)).toBe(true);
});

test.each(["distribution/app.js", "src/artifact.js", "src/main.js"])(
  "keeps other paths outside generated artifact folders: %s",
  (file) => {
    expect(isGeneratedArtifactPath(file)).toBe(false);
  },
);
