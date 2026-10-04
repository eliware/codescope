import { remainingCharBudget } from "../../src/combine/remaining-char-budget.mjs";

test("subtracts included section lengths and separators from a finite budget", () => {
  expect(remainingCharBudget(["one", null, "three"], 20)).toBe(11);
});

test("keeps an unbounded budget unbounded", () => {
  expect(remainingCharBudget(["one"], Infinity)).toBe(Infinity);
});
