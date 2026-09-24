import { errorChainHasCode, errorChainText } from "../../../src/cli/errors/cause-chain.mjs";

test("collects messages and codes from nested causes", () => {
  const cause = Object.assign(new Error("outer"), {
    cause: Object.assign(new Error("inner"), { code: "SIGINT" }),
  });
  expect(errorChainText(cause)).toBe("outer inner");
  expect(errorChainHasCode(cause, "SIGINT")).toBe(true);
  expect(errorChainHasCode(cause, "SIGTERM")).toBe(false);
});

test("supports message-shaped errors", () => {
  expect(errorChainText({ message: "outer", cause: { message: "inner" } })).toBe("outer inner");
});
