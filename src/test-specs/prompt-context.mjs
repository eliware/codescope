const START = "[[CODESCOPE_TEST_SPEC_PROMPT:";
const END = "[[/CODESCOPE_TEST_SPEC_PROMPT]]";

export function frameTestSpecPromptContext(instructions) {
  return `${START}${instructions.length}]]\n${instructions}\n${END}`;
}

export function extractTestSpecPromptContext(combined) {
  const start = combined.indexOf(START);
  if (start < 0) return { combined, instructions: "" };
  const headerEnd = combined.indexOf("]]\n", start);
  const lengthText = combined.slice(start + START.length, headerEnd);
  if (headerEnd < 0 || !/^\d+$/u.test(lengthText))
    throw new Error("Malformed Eliware Test prompt context marker");
  const contentStart = headerEnd + 3;
  const contentLength = Number(lengthText);
  const contentEnd = contentStart + contentLength;
  const trailer = `\n${END}`;
  if (combined.slice(contentEnd, contentEnd + trailer.length) !== trailer)
    throw new Error("Incomplete Eliware Test prompt context marker");
  const end = contentEnd + trailer.length;
  return {
    combined: combined.slice(0, start) + combined.slice(end),
    instructions: combined.slice(contentStart, contentEnd),
  };
}
