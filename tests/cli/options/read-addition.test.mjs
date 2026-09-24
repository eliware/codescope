import { readAddition } from "../../../src/cli/options/read-addition.mjs";

test("reads a nonblank addition value", () => {
  expect(readAddition(["--add", "note"], 0)).toEqual({ value: "note", nextIndex: 1 });
});

test("reads equals-form additions without changing their text", () => {
  expect(readAddition(["--add=note=more"], 0)).toEqual({ value: "note=more", nextIndex: 0 });
  expect(readAddition(["-a= note "], 0)).toEqual({ value: " note ", nextIndex: 0 });
});

test("rejects blank equals-form additions", () => {
  expect(() => readAddition(["--add=  "], 0)).toThrow("--add requires a value");
});
