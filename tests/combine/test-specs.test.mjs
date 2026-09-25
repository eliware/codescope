import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { combineTestSpecs } from "../../src/combine/test-specs.mjs";

test("includes only package-selected records from the adjacent Test specs", async () => {
  const root = await fsTemp("codescope-test-specs-");
  const testRoot = path.join(root, "test");
  const project = path.join(root, "project");
  await mkdir(path.join(testRoot, "specs", "conventions"), { recursive: true });
  await mkdir(project);
  await writeFile(path.join(testRoot, "specs", "conventions", "general.json"), '{"version":"8.0"}');
  await writeFile(path.join(testRoot, "specs", "conventions", "cli.json"), '{"cli":true}');
  await writeFile(path.join(testRoot, "specs", "conventions", "web.json"), '{"web":true}');
  await writeFile(
    path.join(project, "package.json"),
    JSON.stringify({ eliware: { apply: ["general", "cli"] } }),
  );
  try {
    const result = await combineTestSpecs(project, { readFileContents: readFile });
    expect(result).toContain("test/specs/conventions/general.json");
    expect(result).toContain("test/specs/conventions/cli.json");
    expect(result).not.toContain("web.json");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("reports selected profiles missing from the adjacent Test specs", async () => {
  const root = await fsTemp("codescope-missing-test-spec-");
  const testRoot = path.join(root, "test");
  const project = path.join(root, "project");
  await mkdir(path.join(testRoot, "specs", "conventions"), { recursive: true });
  await mkdir(project);
  await writeFile(
    path.join(project, "package.json"),
    JSON.stringify({ eliware: { apply: ["application"] } }),
  );
  try {
    await expect(combineTestSpecs(project, { testRoot })).resolves.toContain(
      "Test specification evidence incomplete; missing records: application",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("does not separately load profile records when reviewing eliware-test", async () => {
  const root = await fsTemp("codescope-self-test-");
  let discovered = false;
  try {
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ name: "@eliware/test", eliware: { apply: ["not-even-required"] } }),
    );
    await expect(
      combineTestSpecs(root, {
        readDirectory: async () => {
          discovered = true;
          return [];
        },
      }),
    ).resolves.toBe("");
    expect(discovered).toBe(false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects invalid read concurrency before reading applicability", async () => {
  await expect(combineTestSpecs("repo", { concurrency: 0 })).rejects.toThrow(/positive integer/);
});

test("reports unavailable Test checkout and package applicability", async () => {
  const root = await fsTemp("codescope-test-specs-");
  try {
    await writeFile(path.join(root, "package.json"), JSON.stringify({ eliware: { apply: [] } }));
    await expect(combineTestSpecs(root)).resolves.toContain(
      "Adjacent eliware/test checkout not supplied",
    );
    await expect(combineTestSpecs(path.join(root, "missing-project"))).resolves.toContain(
      "Test-spec applicability unavailable",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function fsTemp(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}
