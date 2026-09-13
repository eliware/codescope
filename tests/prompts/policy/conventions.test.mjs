import { conventionPolicy } from '../../../src/prompts/policy/conventions.mjs';

test('covers the supplied v8 convention contract', () => {
  expect(conventionPolicy).toContain('README');
  expect(conventionPolicy).toContain('AGENTS.md');
  expect(conventionPolicy).toContain('documentation indexes');
  expect(conventionPolicy).toContain('specs');
  expect(conventionPolicy).toContain('examples');
  expect(conventionPolicy).toContain('package metadata');
  expect(conventionPolicy).toContain('missing or unsupplied artifacts');
  expect(conventionPolicy).toContain('P1 for a proven defect');
  expect(conventionPolicy).toContain('P2 or P3');
  expect(conventionPolicy).toContain('Do not duplicate');
  expect(conventionPolicy).toContain('Convention v8');
  expect(conventionPolicy).toContain('structured JSON');
  expect(conventionPolicy).toContain('Do not infer applicability');
  expect(conventionPolicy).toContain('reviewContract');
  expect(conventionPolicy).toContain('remain authoritative in Eliware Conventions');
});
