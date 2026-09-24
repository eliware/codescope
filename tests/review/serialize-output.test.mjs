import { serializeOutput } from "../../src/review/serialize-output.mjs";

test("serializes unsupported primitive values safely", () => {
  expect(serializeOutput(1n)).toBe('{"type":"bigint","value":"1"}');
  expect(serializeOutput(undefined)).toBe('{"type":"undefined"}');
});

test("serializes symbols and functions with explicit types", () => {
  expect(serializeOutput(Symbol("x"))).toBe('{"type":"symbol","value":"Symbol(x)"}');
  const callback = () => "x";
  expect(JSON.parse(serializeOutput(callback))).toEqual({
    type: "function",
    value: String(callback),
  });
});

test("returns an unserializable marker for cyclic output", () => {
  const output = {};
  output.self = output;
  expect(serializeOutput(output)).toBe('{"type":"unserializable"}');
});
