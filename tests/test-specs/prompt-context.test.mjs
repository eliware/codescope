import {
  extractTestSpecPromptContext,
  frameTestSpecPromptContext,
} from "../../src/test-specs/prompt-context.mjs";

test("frames and extracts developer convention instructions", () => {
  const instructions = "Applicable files: general.yaml.\nDo:\n- Keep it simple.";
  const source = `package evidence\n${frameTestSpecPromptContext(instructions)}\nREADME evidence`;

  expect(extractTestSpecPromptContext(source)).toEqual({
    combined: "package evidence\n\nREADME evidence",
    instructions,
  });
});

test("leaves context without convention instructions unchanged", () => {
  expect(extractTestSpecPromptContext("repository evidence")).toEqual({
    combined: "repository evidence",
    instructions: "",
  });
});

test("rejects malformed and incomplete convention instruction markers", () => {
  expect(() => extractTestSpecPromptContext("[[CODESCOPE_TEST_SPEC_PROMPT:no]]")).toThrow(
    "Malformed Eliware Test prompt context marker",
  );
  expect(() => extractTestSpecPromptContext("[[CODESCOPE_TEST_SPEC_PROMPT:5]]\nshort")).toThrow(
    "Incomplete Eliware Test prompt context marker",
  );
});
