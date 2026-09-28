import { prepareRequest } from "../../src/review/request.mjs";
import { defaultDeveloperText } from "../../src/prompts/guidance.mjs";

const developerMessage = (text) => ({
  role: "developer",
  content: [{ type: "input_text", text }],
});

test("coordinates validation, supported-field projection, and placeholder evidence", () => {
  const prompt = {
    model: "x",
    tools: [],
    store: false,
    input: [developerMessage("<combine-mjs here>")],
  };
  const request = prepareRequest(prompt, "SOURCE");

  expect(request).toMatchObject({ model: "x", tools: [], store: false });
  expect(request.input[0].content[0].text).toContain("SOURCE");
  expect(prompt.input[0].content[0].text).toBe("<combine-mjs here>");
});

test("coordinates built-in prompt evidence insertion", () => {
  const request = prepareRequest(
    {
      input: [
        developerMessage(defaultDeveloperText),
        { role: "user", content: [{ type: "input_text", text: "review" }] },
      ],
    },
    "SOURCE",
  );

  expect(request.input[1].content[0].text).toContain("SOURCE");
});
