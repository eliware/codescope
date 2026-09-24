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

test("stops safely on self-referential and cyclic causes", () => {
  const self = Object.assign(new Error("self"), { code: "SIGINT" });
  self.cause = self;
  expect(errorChainText(self)).toBe("self");
  expect(errorChainHasCode(self, "SIGINT")).toBe(true);

  const first = new Error("first");
  const second = Object.assign(new Error("second"), { code: "SIGTERM" });
  first.cause = second;
  second.cause = first;
  expect(errorChainText(first)).toBe("first second");
  expect(errorChainHasCode(first, "SIGTERM")).toBe(true);
  expect(errorChainHasCode(first, "missing")).toBe(false);
});
