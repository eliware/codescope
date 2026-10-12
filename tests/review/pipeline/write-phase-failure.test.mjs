import {
  runReviewPhase,
  writePhaseFailure,
} from "../../../src/review/pipeline/write-phase-failure.mjs";

test("maps a phase failure through the shared session failure path", async () => {
  await expect(
    writePhaseFailure({
      cause: new Error("failed"),
    }),
  ).rejects.toThrow("OpenAI request failed: failed");
});

test("runs a successful phase without changing its result", async () => {
  await expect(runReviewPhase(async () => "result", { write: async () => {} })).resolves.toBe(
    "result",
  );
});

test("runs a successful phase without failure options", async () => {
  await expect(runReviewPhase(async () => "result")).resolves.toBe("result");
});
