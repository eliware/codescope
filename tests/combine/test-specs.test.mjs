import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { combineTestSpecs } from "../../src/combine/test-specs.mjs";
import { extractTestSpecPromptContext } from "../../src/test-specs/prompt-context.mjs";

test("includes only package-selected records from the adjacent Test specs", async () => {
  const root = await fsTemp("codescope-test-specs-");
  const testRoot = path.join(root, "test");
  const project = path.join(root, "project");
  await mkdir(path.join(testRoot, "specs", "conventions"), { recursive: true });
  await mkdir(project);
  const packageVersion = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url)),
  ).version;
  await writeFile(
    path.join(testRoot, "specs", "conventions", "general.yaml"),
    `version: "${packageVersion}"\ndirectives:\n  - id: E-0.1\n    dos:\n      - General test rule`,
  );
  await writeFile(
    path.join(testRoot, "specs", "conventions", "cli.yaml"),
    "directives:\n  - id: E-0.2\n    donts:\n      - CLI test prohibition",
  );
  await writeFile(
    path.join(testRoot, "specs", "conventions", "web.yaml"),
    "directives:\n  - id: E-0.3\n    dos:\n      - Web test rule",
  );
  await writeFile(
    path.join(project, "package.json"),
    JSON.stringify({ eliware: { apply: ["general", "cli"] } }),
  );
  try {
    const result = await combineTestSpecs(project, { readFileContents: readFile });
    const context = extractTestSpecPromptContext(result);
    expect(context.instructions).toContain(
      "This repository must comply with the rules set forth in general.yaml and cli.yaml.",
    );
    expect(context.instructions).toContain("General test rule");
    expect(context.instructions).toContain("CLI test prohibition");
    expect(context.instructions).not.toContain("id: E-0.1");
    expect(context.instructions).not.toContain("web.yaml");
    expect(context.combined).not.toContain("General test rule");
    expect(result).not.toContain("web.yaml");
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
      "Convention contents are incomplete; missing application.yaml",
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
      "Adjacent eliware/test checkout is not supplied",
    );
    await expect(combineTestSpecs(path.join(root, "missing-project"))).resolves.toContain(
      "Test-spec applicability unavailable",
    );
    await expect(
      combineTestSpecs(root, {
        readPackageJson: async () => {
          throw Object.assign(new Error("permission denied"), { code: "EACCES" });
        },
      }),
    ).resolves.toContain("Test-spec applicability unavailable: package.json could not be read");
    await expect(combineTestSpecs(root, { readPackageJson: async () => "{}" })).resolves.toContain(
      "Test-spec applicability invalid:",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function fsTemp(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}
