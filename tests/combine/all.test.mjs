import { combineAllFiles } from "../../src/combine/all.mjs";

test("preserves the all-context section ordering", async () => {
  const names = [
    "package.json",
    ".github/ci.yml",
    "deploy.yaml",
    "guide.md",
    "app.mjs",
    "app.test.mjs",
    "data.json",
    "image.bin",
  ];
  const result = await combineAllFiles("/repo", {
    readDirectory: async (directory) =>
      directory.endsWith("repo")
        ? [
            ...names
              .filter((name) => !name.includes("/"))
              .map((name) => ({ name, isFile: () => true })),
            { name: ".github", isDirectory: () => true },
          ]
        : [{ name: "ci.yml", isFile: () => true }],
    readFileContents: async (file) => {
      const name = file.split(/[\\/]/u).pop();
      if (name === "package.json") return "{}";
      if (name === "image.bin") return Buffer.from([0, 1]);
      return name.endsWith(".yml") || name.endsWith(".yaml")
        ? "name: check"
        : name.endsWith(".md")
          ? "# docs"
          : "code";
    },
    readOtherFileContents: async (file) => ({
      data: file.endsWith("image.bin") ? Buffer.from([0, 1]) : "data",
      truncated: false,
    }),
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });
  expect(result).toContain("===== deploy.yaml =====\n1 name: check");
  expect(result).toContain("===== .github/ci.yml =====");
  expect(result).not.toContain("===== repository configuration =====");
  expect(result).not.toContain("deploy.yaml | text");
  expect([...result.matchAll(/===== \.github\/ci\.yml =====/gu)]).toHaveLength(1);
  expect(result.indexOf("===== package.json =====")).toBeLessThan(
    result.indexOf("===== guide.md ====="),
  );
  expect(result.indexOf("===== guide.md =====")).toBeLessThan(
    result.indexOf("===== app.mjs ====="),
  );
  expect(result.indexOf("===== app.mjs =====")).toBeLessThan(
    result.indexOf("===== app.test.mjs ====="),
  );
  expect(result.indexOf("===== app.test.mjs =====")).toBeLessThan(result.indexOf("image.bin |"));
});

test("propagates the all-context character limit", async () => {
  await expect(
    combineAllFiles("/repo", {
      readDirectory: async () => [],
      readFileContents: async () => "{}",
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      maxChars: 1,
    }),
  ).rejects.toThrow(/character limit/);
});

test("uses default options at the public all-context boundary", async () => {
  await expect(combineAllFiles(process.cwd())).resolves.toContain("===== package.json =====");
});

test("includes eliware-test specs normally without separately injecting profiles", async () => {
  const result = await combineAllFiles("/repo", {
    readDirectory: async (directory) =>
      directory === "/repo"
        ? [
            { name: "package.json", isFile: () => true },
            { name: "specs", isDirectory: () => true },
          ]
        : [{ name: "general.json", isFile: () => true }],
    platform: "linux",
    readFileContents: async (file) =>
      file.endsWith("package.json")
        ? JSON.stringify({ name: "@eliware/test", eliware: { apply: ["general"] } })
        : '{"directive":"included"}',
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });
  expect(result).toContain("===== specs/general.json =====");
  expect(result).toContain('{"directive":"included"}');
  expect(result).not.toContain("Eliware Test specifications");
});
