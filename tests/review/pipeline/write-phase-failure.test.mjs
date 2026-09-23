import { runReviewPhase, writePhaseFailure } from '../../../src/review/pipeline/write-phase-failure.mjs';

test('maps a phase failure through the shared session failure path', async () => {
  await expect(writePhaseFailure({ cause: new Error('failed'), write: async () => {}, fallbackCause: new Error('fallback') }))
    .rejects.toThrow(/failed|fallback/);
});

test('runs a successful phase without changing its result', async () => {
  await expect(runReviewPhase(async () => 'result', { write: async () => {} })).resolves.toBe('result');
});
