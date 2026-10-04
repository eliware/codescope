import { compileTestSpecRecords } from "../../../src/combine/test-specs/compile-records.mjs";

test("flattens nested do and don't rules without identifiers or examples", () => {
  const rules = compileTestSpecRecords(
    ["general.yaml", "app.yaml"],
    [
      `directives:
  - id: G-1
    dos:
      - "  Keep   this rule concise. "
    donts:
      - Avoid this behavior.
    examples:
      - purpose: excluded
        text: Not a rule.
    directives:
      - id: G-1.1
        dos:
          - Keep this rule concise.
          - Nested rule.
          - "   "
  `,
      `directives:
  - id: A-1
    donts:
      - Second prohibition.
  `,
    ],
  );

  expect(rules).toEqual({
    dos: ["Keep this rule concise.", "Nested rule."],
    donts: ["Avoid this behavior.", "Second prohibition."],
  });
});

test.each([
  { files: ["one.yaml"], sources: [], message: /matching lengths/ },
  { files: ["one.yaml"], sources: ["directives: ["], message: /Unable to parse.*one.yaml/ },
  { files: ["one.yaml"], sources: ["null"], message: /must contain a mapping/ },
  { files: ["one.yaml"], sources: ["name: spec"], message: /must contain a directives list/ },
  {
    files: ["one.yaml"],
    sources: ["directives: [invalid]"],
    message: /contains an invalid directive/,
  },
  {
    files: ["one.yaml"],
    sources: ["directives:\n  - dos: invalid"],
    message: /invalid dos list/,
  },
  {
    files: ["one.yaml"],
    sources: ["directives:\n  - donts: [false]"],
    message: /non-text donts rule/,
  },
  {
    files: ["one.yaml"],
    sources: ["directives:\n  - directives: invalid"],
    message: /must contain a directives list/,
  },
])("rejects malformed convention records: $message", ({ files, sources, message }) => {
  expect(() => compileTestSpecRecords(files, sources)).toThrow(message);
});
