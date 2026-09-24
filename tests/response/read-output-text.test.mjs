import { readOutputText } from "../../src/response/read-output-text.mjs";

test("returns selected function arguments unchanged", () => {
  const call = { type: "function_call", name: "review", arguments: "raw text" };
  const request = { tool_choice: { name: "review" } };
  const text = readOutputText({ output: [call] }, request);
  expect(text).toBe("raw text");
});

test("rejects a missing selected function call", () => {
  const request = { tool_choice: { name: "review" } };
  expect(() => readOutputText({ output: [] }, request)).toThrow(/required function call/);
});

test("rejects multiple matching function calls", () => {
  const call = { type: "function_call", name: "review", arguments: "text" };
  const response = { output: [call, call] };
  const request = { tool_choice: { name: "review" } };
  expect(() => readOutputText(response, request)).toThrow(/multiple matching/);
});

test("rejects non-text function-call arguments", () => {
  const call = { type: "function_call", name: "review", arguments: {} };
  const response = { output: [call] };
  const request = { tool_choice: { name: "review" } };
  expect(() => readOutputText(response, request)).toThrow(/raw text/);
});

test("uses raw output text when no function call is selected", () => {
  expect(readOutputText({ output_text: "" }, {})).toBe("");
  const request = { tool_choice: { type: "auto" } };
  expect(readOutputText({ output_text: "answer" }, request)).toBe("answer");
});

test("rejects malformed collections and responses without text", () => {
  expect(() => readOutputText({ output: {} }, {})).toThrow(/output was not an array/);
  expect(() => readOutputText({ output: [] }, {})).toThrow(/usable output/);
});
