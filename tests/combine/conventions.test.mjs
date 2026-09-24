import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { combineConventionFiles } from "../../src/combine/conventions.mjs";

test("includes only package-selected directive records", async () => {
  const root = await fsTemp("codescope-conventions-");
  const specs = path.join(root, "specs");
  await mkdir(specs, { recursive: true });
  await mkdir(path.join(root, "project"));
  await writeFile(path.join(specs, "general.json"), '{"version":"8.0"}');
  await writeFile(path.join(specs, "cli.json"), '{"cli":true}');
  await writeFile(path.join(specs, "web.json"), '{"web":true}');
  await writeFile(
    path.join(root, "project", "package.json"),
    JSON.stringify({
      eliware: { apply: ["general", "cli"] },
    }),
  );
  try {
    const result = await combineConventionFiles(path.join(root, "project"), {
      conventionsRoot: root,
      readFileContents: readFile,
    });
    expect(result).toContain("conventions/specs/general.json");
    expect(result).toContain("conventions/specs/cli.json");
    expect(result).not.toContain("web.json");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("supplies only indexed canonical records to eliware-test and reports missing indexed records", async () => {
  const root = await fsTemp("codescope-conventions-");
  const specs = path.join(root, "specs");
  const project = path.join(root, "project");
  await mkdir(specs, { recursive: true });
  await mkdir(project);
  await writeFile(
    path.join(specs, "README.md"),
    [
      "# Convention specifications",
      "## Files",
      "- [./general.json](./general.json)",
      "- [cli.json](cli.json)",
      "- [authority.json](authority.json) — Local authority registry.",
    ].join("\n"),
  );
  await writeFile(path.join(specs, "general.json"), '{"canonical":"general"}');
  await writeFile(path.join(specs, "cli.json"), '{"canonical":"cli"}');
  await writeFile(path.join(specs, "authority.json"), '{"authority":true}');
  await writeFile(path.join(specs, "unrelated.json"), '{"unrelated":true}');
  await writeFile(
    path.join(project, "package.json"),
    JSON.stringify({
      name: "@eliware/test",
      eliware: { apply: ["general"] },
    }),
  );
  try {
    const result = await combineConventionFiles(project, { conventionsRoot: root });
    expect(result).toContain("conventions/specs/general.json");
    expect(result).toContain("conventions/specs/cli.json");
    expect(result).not.toContain("authority.json");
    expect(result).not.toContain("unrelated.json");

    await rm(path.join(specs, "cli.json"));
    const incomplete = await combineConventionFiles(project, { conventionsRoot: root });
    expect(incomplete).toContain("Convention evidence incomplete");
    expect(incomplete).toContain("cli.json");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects invalid read concurrency before discovery", async () => {
  await expect(combineConventionFiles("repo", { concurrency: 0 })).rejects.toThrow(
    /positive integer/,
  );
});

test("reports unavailable checkout and package applicability", async () => {
  const root = await fsTemp("codescope-conventions-");
  try {
    await expect(combineConventionFiles("missing-project")).resolves.toContain(
      "Convention checkout not supplied",
    );

    await mkdir(path.join(root, "specs"));
    await expect(
      combineConventionFiles(path.join(root, "missing-project"), { conventionsRoot: root }),
    ).resolves.toContain("Convention applicability unavailable");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("reports why the canonical directive index could not be read", async () => {
  const root = await fsTemp("codescope-conventions-");
  const specs = path.join(root, "specs");
  const project = path.join(root, "project");
  await mkdir(specs, { recursive: true });
  await mkdir(project);
  await writeFile(path.join(specs, "README.md"), "- [general.json](general.json)\n");
  await writeFile(path.join(specs, "general.json"), "{}");
  await writeFile(
    path.join(project, "package.json"),
    JSON.stringify({
      name: "@eliware/test",
      eliware: { apply: ["general"] },
    }),
  );
  try {
    const result = await combineConventionFiles(project, {
      conventionsRoot: root,
      readFileContents: async (filePath, encoding) => {
        if (filePath === path.join(specs, "README.md")) throw new Error("index read denied");
        return readFile(filePath, encoding);
      },
    });
    expect(result).toContain(
      "Convention directive index unavailable: Unable to read conventions/specs/README.md: index read denied",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function fsTemp(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}
