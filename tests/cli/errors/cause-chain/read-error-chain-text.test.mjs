import { readErrorChainText } from "../../../../src/cli/errors/cause-chain/read-error-chain-text.mjs";

test("joins Error and message-shaped cause text", () => {
  const cause = Object.assign(new Error("outer"), {
    cause: { message: "inner", cause: { code: "API" } },
  });
  expect(readErrorChainText(cause)).toBe("outer inner");
});

test("returns empty text when the chain contains no messages", () => {
  expect(readErrorChainText({ cause: { code: "API" } })).toBe("");
});
