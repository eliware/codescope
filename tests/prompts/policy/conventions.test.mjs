import { conventionPolicy } from '../../../src/prompts/policy/conventions.mjs';

test('covers the supplied convention contract', () => {
  expect(conventionPolicy).toContain('README.md');
  expect(conventionPolicy).toContain('AGENTS.md');
  expect(conventionPolicy).toContain('RELEASE_NOTES.md');
  expect(conventionPolicy).toContain('docs/');
  expect(conventionPolicy).toContain('specs/');
  expect(conventionPolicy).toContain('examples/');
  expect(conventionPolicy).toContain('.env.example');
  expect(conventionPolicy).toContain('package metadata');
  expect(conventionPolicy).toMatch(/missing\s+or unsupplied files/u);
  expect(conventionPolicy).toContain('P1 only when');
  expect(conventionPolicy).toContain('P2 or P3');
  expect(conventionPolicy).toContain('Do not duplicate');
  expect(conventionPolicy).toContain('Do not report missing stored CI');
  expect(conventionPolicy).toContain('no CI workflow evidence');
  expect(conventionPolicy).toContain('Ubuntu runner');
  expect(conventionPolicy).toContain('Windows runner is');
  expect(conventionPolicy).toContain('optional unless');
  expect(conventionPolicy).toContain('Ubuntu or Windows CI as');
  expect(conventionPolicy).toContain('execution results are not supplied');
  expect(conventionPolicy).toContain('Eliware <eliware@eliware.org>');
  expect(conventionPolicy).toContain('https://discord.gg/M6aTR9eTwN');
  expect(conventionPolicy).toContain('Convention v6.1');
});
