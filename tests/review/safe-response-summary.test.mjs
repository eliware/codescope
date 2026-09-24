import { safeResponseSummary } from "../../src/review/safe-response-summary.mjs";

test("returns an empty summary when response inspection throws", () => {
  const response = new Proxy(
    {},
    {
      get() {
        throw new Error("malformed response");
      },
    },
  );

  expect(safeResponseSummary(response)).toEqual({});
});
