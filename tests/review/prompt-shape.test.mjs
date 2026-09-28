import { validatePromptShape } from "../../src/review/prompt-shape.mjs";

test("accepts one developer input-text message", () => {
  expect(() =>
    validatePromptShape({
      input: [{ role: "developer", content: [{ type: "input_text", text: "review" }] }],
    }),
  ).not.toThrow();
});

test("rejects invalid prompt and message structure", () => {
  for (const prompt of [null, [], { input: "bad" }, { input: [null] }])
    expect(() => validatePromptShape(prompt)).toThrow();
  for (const input of [
    [{ role: 1, content: [] }],
    [{ role: "user", content: "bad" }],
    [{ role: "user", content: [{ type: 1 }] }],
    [{ role: "developer", content: [{ type: "input_text", text: 1 }] }],
  ])
    expect(() => validatePromptShape({ input })).toThrow();
});

test("requires exactly one developer message with one text part", () => {
  const developer = { role: "developer", content: [{ type: "input_text", text: "review" }] };
  expect(() => validatePromptShape({ input: [] })).toThrow("exactly one developer");
  expect(() => validatePromptShape({ input: [developer, developer] })).toThrow(
    "exactly one developer",
  );
  expect(() =>
    validatePromptShape({
      input: [
        {
          role: "developer",
          content: [
            { type: "input_text", text: "a" },
            { type: "input_text", text: "b" },
          ],
        },
      ],
    }),
  ).toThrow("exactly one input_text");
});
