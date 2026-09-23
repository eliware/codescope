import { createSectionBudget } from '../../src/combine/section-budget.mjs';

test('passes the remaining finite budget and accounts for separators', async () => {
  const budget = createSectionBudget(5, 20);
  let remaining;
  await expect(budget.read((value) => { remaining = value; return 'abc'; })).resolves.toBe('abc');
  expect(remaining).toBe(14);
  await expect(budget.read(() => '')).resolves.toBe('');
});

test('does not constrain an unbounded budget', async () => {
  const budget = createSectionBudget(5, Number.POSITIVE_INFINITY);
  await expect(budget.read((remaining) => {
    expect(remaining).toBe(Number.POSITIVE_INFINITY);
    return 'content';
  })).resolves.toBe('content');
});

test('reserves a separator after the first emitted section', async () => {
  const budget = createSectionBudget(0, 10);
  await budget.read(() => 'abc');
  let remaining;
  await budget.read((value) => { remaining = value; return 'de'; });
  expect(remaining).toBe(6);
});
