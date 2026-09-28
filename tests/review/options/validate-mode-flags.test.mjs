import { validateModeFlags } from "../../../src/review/options/validate-mode-flags.mjs";

test("accepts omitted and boolean mode flags", () => {
  expect(() => validateModeFlags({})).not.toThrow();
  expect(() => validateModeFlags({ usage: false, dryRun: true })).not.toThrow();
});

test("rejects nonboolean usage and dry-run flags", () => {
  expect(() => validateModeFlags({ usage: 1 })).toThrow(/usage must be a boolean/);
  expect(() => validateModeFlags({ dryRun: "true" })).toThrow(/dryRun must be a boolean/);
});
