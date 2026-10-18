import {
  parseDotenvAssignment,
  parseDotenvValue,
} from "../../../src/review/dotenv/value-parser.mjs";

test("parses generic dotenv assignments and ignores other lines", () => {
  expect(parseDotenvAssignment("export SERVICE_NAME = worker")).toEqual({
    name: "SERVICE_NAME",
    value: "worker",
  });
  expect(parseDotenvAssignment("# comment")).toBeNull();
  expect(parseDotenvAssignment("not dotenv")).toBeNull();
});

test("decodes generic quoted values and strips inline comments", () => {
  expect(parseDotenvValue('"line\\nnext\\tvalue"')).toBe("line\nnext\tvalue");
  expect(parseDotenvValue("'say \\\'hello\\\''")).toBe("say 'hello'");
  expect(parseDotenvValue("plain-value # note")).toBe("plain-value");
  expect(parseDotenvValue('"quoted value" # note')).toBe("quoted value");
});

test("rejects malformed quoted dotenv values", () => {
  expect(() => parseDotenvValue('"unterminated')).toThrow(/Invalid quoted/);
  expect(() => parseDotenvValue("'unterminated")).toThrow(/Invalid quoted/);
  expect(() => parseDotenvValue('"value"junk')).toThrow(/Invalid quoted/);
});
