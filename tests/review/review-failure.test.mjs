import { throwSessionFailure } from "../../src/review/review-failure.mjs";

test("throws the provider failure without writing a partial result", async () => {
  let wrote = false;
  await expect(
    throwSessionFailure({
      cause: new Error("invalid response"),
      write: () => {
        wrote = true;
      },
    }),
  ).rejects.toThrow("OpenAI request failed: invalid response");
  expect(wrote).toBe(false);
});
