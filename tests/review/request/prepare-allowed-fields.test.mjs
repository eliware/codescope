import { prepareAllowedRequestFields } from "../../../src/review/request/prepare-allowed-fields.mjs";

test("rejects unsupported request fields and projects the allowed fields", () => {
  const prompt = { model: "x", input: [], tools: [], custom: "ignored" };
  expect(() => prepareAllowedRequestFields(prompt)).toThrow("unsupported fields: custom");
  expect(prepareAllowedRequestFields({ model: "x", input: [], tools: [] })).toEqual({
    model: "x",
    input: [],
    tools: [],
  });
});

test("rejects invalid Responses API field values", () => {
  for (const prompt of [
    { model: 1, input: [] },
    { model: "", input: [] },
    { tools: "invalid", input: [] },
    { store: "invalid", input: [] },
  ])
    expect(() => prepareAllowedRequestFields(prompt)).toThrow("invalid Responses API fields");
});

test("returns an independent copy of supported nested request data", () => {
  const prompt = { input: [{ role: "user", content: [{ type: "input_text", text: "review" }] }] };
  const request = prepareAllowedRequestFields(prompt);
  request.input[0].content[0].text = "changed";
  expect(prompt.input[0].content[0].text).toBe("review");
});
