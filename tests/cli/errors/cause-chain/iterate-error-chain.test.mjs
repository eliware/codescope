import { iterateErrorChain } from "../../../../src/cli/errors/cause-chain/iterate-error-chain.mjs";

test("iterates each unique error cause once, including cyclic chains", () => {
  const first = new Error("first");
  const second = new Error("second");
  first.cause = second;
  second.cause = first;
  expect([...iterateErrorChain(first)]).toEqual([first, second]);
});

test("returns an empty chain for an absent cause", () => {
  expect([...iterateErrorChain(undefined)]).toEqual([]);
});
