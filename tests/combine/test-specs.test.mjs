import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { combineTestSpecs } from "../../src/combine/test-specs.mjs";
import { extractTestSpecPromptContext } from "../../src/test-specs/prompt-context.mjs";

test("includes complete selected semantic specs and omits deterministic specs", async () => {
  const root = await fsTemp("codescope-test-specs-");
  const testRoot = path.join(root, "test12");
  const project = path.join(root, "project");
  await mkdir(path.join(testRoot, "specs", "conventions"), { recursive: true });
  await mkdir(project);
  await writeFile(
    path.join(testRoot, "specs", "conventions", "general-semantic.yaml"),
    `version: "12.0"\ndirectives:\n  - id: E-0.1\n    dos:\n      - General test rule\n    examples:\n      - purpose: preserved test example`,
  );
  await writeFile(
    path.join(testRoot, "specs", "conventions", "general-deterministic.yaml"),
    "must_not_be_included: true",
  );
  await writeFile(
    path.join(testRoot, "specs", "conventions", "cli-semantic.yaml"),
    'version: "12.0"\ndirectives:\n  - id: E-0.2\n    donts:\n      - CLI test prohibition',
  );
  await writeFile(
    path.join(testRoot, "specs", "conventions", "web-semantic.yaml"),
    'version: "12.0"\ndirectives:\n  - id: E-0.3\n    dos:\n      - Web test rule',
  );
  await writeFile(
    path.join(project, "package.json"),
    JSON.stringify({ eliware: { apply: ["general", "cli"] } }),
  );
  try {
    const result = await combineTestSpecs(project, { readFileContents: readFile });
    const context = extractTestSpecPromptContext(result);
    expect(context.instructions).toContain(
      "This repository applies general and cli and does not apply web.",
    );
    expect(context.instructions).toContain("General test rule");
    expect(context.instructions).toContain("purpose: preserved test example");
    expect(context.instructions).toContain("CLI test prohibition");
    expect(context.instructions).toContain(
      'Convention file: general-semantic.yaml\nversion: "12.0"\ndirectives:\n  - id: E-0.1\n    dos:\n      - General test rule\n    examples:\n      - purpose: preserved test example\n\n---\n\nConvention file: cli-semantic.yaml\nversion: "12.0"\ndirectives:\n  - id: E-0.2\n    donts:\n      - CLI test prohibition',
    );
    expect(context.instructions).toContain("id: E-0.1");
    expect(context.instructions).not.toContain("Web test rule");
    expect(context.instructions).not.toContain("must_not_be_included");
    expect(context.combined).not.toContain("General test rule");
    expect(result).toContain("does not apply web");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("loads the selected shared convention from the adjacent test12 checkout", async () => {
  const root = await fsTemp("codescope-test12-specs-");
  const testRoot = path.join(root, "test12", "specs", "conventions");
  const oldTestRoot = path.join(root, "test", "specs", "conventions");
  const project = path.join(root, "codescope");
  await mkdir(testRoot, { recursive: true });
  await mkdir(oldTestRoot, { recursive: true });
  await mkdir(project);
  await writeFile(path.join(testRoot, "general-semantic.yaml"), "version: 12\nsource: test12");
  await writeFile(path.join(oldTestRoot, "general-semantic.yaml"), "version: 11\nsource: test");
  await writeFile(
    path.join(project, "package.json"),
    JSON.stringify({ eliware: { apply: ["general"] } }),
  );
  try {
    const result = await combineTestSpecs(project);

    expect(result).toContain("source: test12");
    expect(result).not.toContain("source: test\n");
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
      "Convention contents are incomplete; missing application",
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
      "Adjacent eliware/test12 checkout is not supplied",
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
