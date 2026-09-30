import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { combineJsonFiles } from "../../src/combine/json.mjs";

test("includes repository JSON while excluding package-lock files", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-json-"));
  try {
    await mkdir(path.join(root, "specs"));
    await mkdir(path.join(root, "examples", "nested"), { recursive: true });
    await mkdir(path.join(root, "tmp"));
    await mkdir(path.join(root, "packages", "tool"), { recursive: true });
    await writeFile(path.join(root, "root.json"), '{"root":true}');
    await writeFile(path.join(root, "package-lock.json"), '{"lockfileVersion":3}');
    await writeFile(path.join(root, "specs", "contract.json"), '{"spec":true}');
    await writeFile(path.join(root, "examples", "nested", "config.json"), '{"example":true}');
    await writeFile(path.join(root, "tmp", "private.json"), '{"private":true}');
    await writeFile(path.join(root, "packages", "tool", "package.json"), '{"name":"tool"}');
    await writeFile(
      path.join(root, "packages", "tool", "package-lock.json"),
      '{"lockfileVersion":3}',
    );
    const result = await combineJsonFiles(root);
    expect(result).toContain("root.json");
    expect(result).toContain("specs/contract.json");
    expect(result).toContain("examples/nested/config.json");
    expect(result).toContain('{"example":true}');
    expect(result).toContain("tmp/private.json");
    expect(result).toContain("packages/tool/package.json");
    expect(result).not.toContain("package-lock.json");
    await expect(combineJsonFiles(root, { maxChars: 1000 })).resolves.toContain("root.json");
    await expect(
      combineJsonFiles("repo", {
        platform: "linux",
        readDirectory: async () => [],
      }),
    ).resolves.toBe("");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
