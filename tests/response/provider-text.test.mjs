import { responseText } from "../../src/response/provider-text.mjs";

test("returns selected provider text unchanged", () => {
  const text = "{not parsed or reformatted}";
  expect(responseText({ output_text: text }, {})).toBe(text);
});

test("tags extraction failures as invalid provider responses", () => {
  const cases = [
    [{ output: {} }, {}],
    [{ output: [] }, { tool_choice: { name: "review" } }],
    [{ output_text: 1 }, {}],
  ];

  for (const [response, request] of cases)
    expect(() => responseText(response, request)).toThrow(
      expect.objectContaining({ code: "INVALID_RESPONSE" }),
    );
});

test("preserves an already classified error", () => {
  const expected = Object.assign(new Error("classified"), { code: "INVALID_RESPONSE" });
  const response = {};
  Object.defineProperty(response, "output", {
    get() {
      throw expected;
    },
  });

  try {
    responseText(response, {});
  } catch (error) {
    expect(error).toBe(expected);
  }
});

test("classifies non-Error failures with a generic message", () => {
  const response = {};
  Object.defineProperty(response, "output", {
    get() {
      throw Object.create(null);
    },
  });

  expect(() => responseText(response, {})).toThrow(
    expect.objectContaining({
      code: "INVALID_RESPONSE",
      message: "Provider response was invalid",
    }),
  );
});
