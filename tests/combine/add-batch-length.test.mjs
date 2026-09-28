import { addBatchLength } from "../../src/combine/add-batch-length.mjs";

test("accounts for section separators and omitted empty batches", () => {
  expect(addBatchLength(0, 10, 2)).toBe(11);
  expect(addBatchLength(11, 20, 1)).toBe(32);
  expect(addBatchLength(0, 0, 0)).toBe(0);
});
