import { combineYamlFiles } from "../../src/combine/yaml.mjs";

test("includes all repository YAML and YML content without the config line limit", async () => {
  const longYaml = Array.from({ length: 205 }, (_, index) => `line-${index + 1}`).join("\n");
  const directories = {
    "/repo": [
      { name: "workflow.yml", isFile: () => true },
      { name: "deploy", isDirectory: () => true },
    ],
    "/repo/deploy": [{ name: "config.yaml", isFile: () => true }],
  };
  const result = await combineYamlFiles("/repo", {
    platform: "linux",
    readDirectory: async (directory) => directories[directory] ?? [],
    readFileContents: async (file) => (file.endsWith("workflow.yml") ? "root: true" : longYaml),
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });
  expect(result).toContain("===== workflow.yml =====\n1 root: true");
  expect(result).toContain("===== deploy/config.yaml =====");
  expect(result).toContain("line-205");
});

test("respects a finite aggregate character budget", async () => {
  await expect(
    combineYamlFiles("/repo", {
      platform: "linux",
      readDirectory: async () => [{ name: "large.yaml", isFile: () => true }],
      readFileContents: async () => "value: " + "x".repeat(200),
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      maxChars: 100,
    }),
  ).rejects.toThrow("Combined source exceeds the 100-character limit");
});

test("uses default options at the public YAML boundary", async () => {
  await expect(combineYamlFiles(process.cwd())).resolves.toContain("===== ");
});
