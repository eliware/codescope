import { EXIT_CODES } from "../../../src/cli/errors/exit-codes.mjs";

test("defines the public process exit statuses", () => {
  expect(EXIT_CODES).toMatchObject({
    PASS: 0,
    USAGE: 2,
    CONFIGURATION: 3,
    INPUT: 4,
    API: 5,
    RESPONSE: 6,
    TEST_TIMEOUT: 124,
    SIGINT: 130,
    SIGTERM: 143,
  });
});
