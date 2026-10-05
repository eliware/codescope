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

test("places repository context before the final review instructions", () => {
  const request = prepareRequest(
    {
      input: [
        developerMessage(defaultDeveloperText),
        { role: "user", content: [{ type: "input_text", text: "review" }] },
      ],
    },
    "SOURCE",
  );

  expect(request.input.map(({ role }) => role)).toEqual(["developer", "user"]);
  expect(request.input[1].content).toHaveLength(1);
  expect(request.input[1].content[0].text).toContain("SOURCE");
  expect(request.input[1].content[0].text).toContain("---begin review instructions ---");
  expect(request.input[1].content[0].text).toContain("review");
});
