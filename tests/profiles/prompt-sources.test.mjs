import { getPromptSource } from "../../src/profiles/prompt-sources.mjs";

test("owns profile prompt-source registration", () => {
  expect(getPromptSource("architecture")).toEqual(
    expect.objectContaining({ input: expect.any(Array) }),
  );
  expect(getPromptSource("missing")).toBeUndefined();
});
