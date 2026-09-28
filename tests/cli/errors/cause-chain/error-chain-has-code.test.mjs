import { errorChainHasCode } from "../../../../src/cli/errors/cause-chain/error-chain-has-code.mjs";

test("finds a matching code in the cause chain", () => {
  expect(errorChainHasCode({ cause: { code: "SIGINT" } }, "SIGINT")).toBe(true);
  expect(errorChainHasCode({ cause: { code: "SIGINT" } }, "SIGTERM")).toBe(false);
});

test("terminates when a matching-code cause chain is cyclic", () => {
  const cause = { code: "SIGINT" };
  cause.cause = cause;
  expect(errorChainHasCode(cause, "SIGINT")).toBe(true);
  expect(errorChainHasCode(cause, "SIGTERM")).toBe(false);
});
