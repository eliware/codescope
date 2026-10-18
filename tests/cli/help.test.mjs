import { jest } from "@jest/globals";
import { usage } from "../../src/cli/help.mjs";

test("reads the quick-start document as the help message", () => {
  const readFile = jest.fn(() => "# Setup guide");
  expect(usage({ readFile })).toBe("# Setup guide");
  expect(readFile).toHaveBeenCalledWith(expect.stringMatching(/docs[\\/]quick-start\.md/u), "utf8");
});
