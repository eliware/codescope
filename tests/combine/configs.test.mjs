import { combineConfigFiles } from "../../src/combine/configs.mjs";

const regular = async () => ({ isSymbolicLink: () => false, isFile: () => true });

test("combines selected configuration sections in inventory order", async () => {
  await expect(
    combineConfigFiles("repo", {
      inventory: [".github/settings.cfg", ".github/image.bin"],
      inspectFile: regular,
      readFileContents: async (file) =>
        file.endsWith(".bin") ? Buffer.from([0, 1]) : "setting: value",
    }),
  ).resolves.toContain("===== .github/settings.cfg =====\n1 setting: value");
});

test("preserves bounded reader concurrency and output order", async () => {
  let active = 0;
  let maximum = 0;
  const result = await combineConfigFiles("repo", {
    inventory: [".github/a.cfg", ".github/b.cfg"],
    concurrency: 2,
    inspectFile: regular,
    readFileContents: async (file) => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active -= 1;
      return file.endsWith("a.cfg") ? "a" : "b";
    },
  });
  expect(maximum).toBe(2);
  expect(result.indexOf(".github/a.cfg")).toBeLessThan(result.indexOf(".github/b.cfg"));
});

test("returns an empty section when no configuration file is selected", async () => {
  await expect(combineConfigFiles("repo", { inventory: ["README.md"] })).resolves.toBe("");
});

test("rejects invalid concurrency and paths outside the root", async () => {
  await expect(
    combineConfigFiles("repo", { inventory: [".github/ci.cfg"], concurrency: 0 }),
  ).rejects.toThrow(/positive integer/);
  await expect(combineConfigFiles("repo", { inventory: ["C:\\outside.yml"] })).rejects.toThrow(
    /escapes review root/,
  );
});

test("rejects a missing inventory after applying default options", async () => {
  await expect(combineConfigFiles("repo")).rejects.toThrow();
});

test("accepts explicit platform semantics for portable inventory paths", async () => {
  await expect(
    combineConfigFiles("C:\\repo", {
      inventory: [".github\\ci.cfg"],
      platform: "win32",
      inspectFile: regular,
      readFileContents: async () => "setting: value",
    }),
  ).resolves.toContain(".github/ci.cfg");
  await expect(
    combineConfigFiles("repo", {
      inventory: [".github/ci.cfg"],
      platform: "linux",
      inspectFile: regular,
      readFileContents: async () => "setting: value",
    }),
  ).resolves.toContain(".github/ci.cfg");
});
