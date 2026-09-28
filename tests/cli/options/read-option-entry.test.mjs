import { readOptionEntry } from "../../../src/cli/options/read-option-entry.mjs";

test("recognizes additions and scalar options through their dedicated readers", () => {
  expect(readOptionEntry(["-a", "short"], 0)).toMatchObject({ kind: "addition", value: "short" });
  expect(readOptionEntry(["--add", "note"], 0)).toMatchObject({
    kind: "addition",
    value: "note",
    nextIndex: 1,
  });
  expect(readOptionEntry(["--add=inline"], 0)).toMatchObject({
    kind: "addition",
    value: "inline",
  });
  expect(readOptionEntry(["--effort=low"], 0)).toMatchObject({
    kind: "scalar",
    scalarKind: "effort",
    normalized: "--effort=low",
  });
});

test("recognizes flags and leaves ordinary tokens unconsumed", () => {
  expect(readOptionEntry(["--dry-run"], 0)).toEqual({ kind: "dry-run", nextIndex: 0 });
  expect(readOptionEntry(["--usage"], 0)).toEqual({ kind: "usage", nextIndex: 0 });
  expect(readOptionEntry(["prompt"], 0)).toBeUndefined();
});
