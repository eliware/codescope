import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { combineYamlFiles } from "../../src/combine/yaml.mjs";

test("includes all repository YAML and YML content without the config line limit", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-yaml-"));
  try {
    await mkdir(path.join(root, "deploy"));
    const longYaml = Array.from({ length: 205 }, (_, index) => `line-${index + 1}`).join("\n");
    await writeFile(path.join(root, "workflow.yml"), "root: true");
    await writeFile(path.join(root, "deploy", "config.yaml"), longYaml);

    const result = await combineYamlFiles(root);

    expect(result).toContain("===== workflow.yml =====\n1 root: true");
    expect(result).toContain("===== deploy/config.yaml =====");
    expect(result).toContain("line-205");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("respects a finite aggregate character budget", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-yaml-limit-"));
  try {
    await writeFile(path.join(root, "large.yaml"), "value: " + "x".repeat(200));
    await expect(combineYamlFiles(root, { maxChars: 100 })).rejects.toThrow(
      "Combined source exceeds the 100-character limit",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
