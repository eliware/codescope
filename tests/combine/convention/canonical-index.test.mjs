import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  parseCanonicalDirectiveIndex,
  readCanonicalDirectiveIndex,
} from "../../../src/combine/convention/canonical-index.mjs";

test("parses unannotated JSON links as canonical directive records only", () => {
  const index = [
    "# Convention specifications",
    "## Files",
    "- [general.json](general.json)",
    "- [nested/cli.json](nested/cli.json)",
    "- [./profile/application.json](./profile/application.json)",
    "- [authority.json](authority.json) — Local authority registry.",
    "- [authority-map.json](authority-map.json) — Canonical schema.",
    "- [label.json](different-target.json)",
    '- [title.json](title.json "annotated link")',
    "- [https://example.org/external.json](https://example.org/external.json)",
    "- [/absolute.json](/absolute.json)",
    "- [C:/drive.json](C:/drive.json)",
    "- [folder\\backslash.json](folder\\backslash.json)",
    "- [../outside.json](../outside.json)",
    "- [notes](notes.md)",
  ].join("\n");
  expect(parseCanonicalDirectiveIndex(index)).toEqual([
    "general.json",
    "nested/cli.json",
    "profile/application.json",
  ]);
});

test("returns no canonical records for an index without directive links", () => {
  expect(parseCanonicalDirectiveIndex("# Convention specifications\n- [notes](notes.md)")).toEqual(
    [],
  );
});

test("reads the canonical index and reports an unavailable or empty index as missing", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "codescope-convention-index-"));
  const specs = path.join(root, "specs");
  await mkdir(specs);
  try {
    const indexPath = path.join(specs, "README.md");
    await writeFile(indexPath, "- [general.json](general.json)\n");
    await expect(readCanonicalDirectiveIndex(specs)).resolves.toEqual(["general.json"]);

    await writeFile(indexPath, "# No directive records\n");
    await expect(readCanonicalDirectiveIndex(specs)).resolves.toBeUndefined();
    await rm(indexPath);
    await expect(readCanonicalDirectiveIndex(specs)).resolves.toBeUndefined();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("uses an injected reader and Windows path rules for the canonical index", async () => {
  const result = await readCanonicalDirectiveIndex("C:\\conventions\\specs", {
    platform: "win32",
    readFileContents: async (filePath) => {
      expect(filePath).toBe("C:\\conventions\\specs\\README.md");
      return "- [cli.json](cli.json)\n";
    },
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });
  expect(result).toEqual(["cli.json"]);
});

test("uses POSIX path rules when requested", async () => {
  const result = await readCanonicalDirectiveIndex("/conventions/specs", {
    platform: "linux",
    readFileContents: async (filePath) => {
      expect(filePath).toBe("/conventions/specs/README.md");
      return "- [general.json](general.json)\n";
    },
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });
  expect(result).toEqual(["general.json"]);
});

test("preserves useful details when the canonical index cannot be read", async () => {
  await expect(
    readCanonicalDirectiveIndex("/conventions/specs", {
      readFileContents: async () => {
        throw new Error("read denied");
      },
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).rejects.toThrow("Unable to read conventions/specs/README.md: read denied");
});

test("recognizes nested ENOENT causes as a missing index", async () => {
  const missing = Object.assign(new Error("missing"), { code: "ENOENT" });
  const wrapped = new Error("outer wrapper", {
    cause: new Error("inner wrapper", { cause: missing }),
  });
  await expect(
    readCanonicalDirectiveIndex("/conventions/specs", {
      readFileContents: async () => {
        throw wrapped;
      },
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).resolves.toBeUndefined();
});

test("stops safely on cyclic errors without hiding their diagnostic", async () => {
  const cyclic = new Error("cyclic read failure");
  cyclic.cause = cyclic;
  await expect(
    readCanonicalDirectiveIndex("/conventions/specs", {
      readFileContents: async () => {
        throw cyclic;
      },
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).rejects.toThrow("Unable to read conventions/specs/README.md: cyclic read failure");
});
