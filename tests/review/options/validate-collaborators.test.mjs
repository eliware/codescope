import { validateReviewCollaborators } from '../../../src/review/options/validate-collaborators.mjs';

const valid = { write: () => {}, readFile: () => {}, combine: () => {}, createClient: () => {}, register: () => {} };

test('accepts required collaborators and optional readers', () => {
  expect(() => validateReviewCollaborators({ ...valid, openEnvFile: () => {}, inspectFile: () => {} })).not.toThrow();
});

test('rejects missing and invalid collaborators', () => {
  expect(() => validateReviewCollaborators({ ...valid, write: null })).toThrow(/write/);
  expect(() => validateReviewCollaborators({ ...valid, inspectFile: null })).toThrow(/inspectFile/);
  expect(() => validateReviewCollaborators({ ...valid, openEnvFile: null })).toThrow(/openEnvFile/);
});
