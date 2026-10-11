import { loadEnv } from "../../src/review/dotenv-parser.mjs";

test("loads only the provider token from dotenv assignments", () => {
  const environment = {};
  loadEnv('export OPENAI_API_TOKEN="secret"\nOTHER=value', environment);
  expect(environment).toEqual({ OPENAI_API_TOKEN: "secret" });
});

test("keeps an existing provider token and ignores unrelated malformed lines", () => {
  const environment = { OPENAI_API_TOKEN: "existing" };
  loadEnv("not dotenv\nOTHER VALUE\nOPENAI_API_TOKEN=file-token", environment);
  expect(environment).toEqual({ OPENAI_API_TOKEN: "existing" });
});

test("rejects malformed provider-token assignments and values", () => {
  expect(() => loadEnv("OPENAI_API_TOKEN without equals", {})).toThrow(/Invalid \.env line/);
  expect(() => loadEnv('OPENAI_API_TOKEN="unterminated', {})).toThrow(/Invalid quoted/);
  expect(() => loadEnv("OPENAI_API_TOKEN='unterminated", {})).toThrow(/Invalid quoted/);
  expect(() => loadEnv('OPENAI_API_TOKEN="secret"junk', {})).toThrow(/Invalid quoted/);
});

test("validates malformed provider-token values before applying existing-token precedence", () => {
  const environment = { OPENAI_API_TOKEN: "process-token" };
  expect(() => loadEnv('OPENAI_API_TOKEN="unterminated', environment)).toThrow(/Invalid quoted/);
  expect(() => loadEnv("OPENAI_API_TOKEN without equals", environment)).toThrow(
    /Invalid \.env line/,
  );
  expect(environment.OPENAI_API_TOKEN).toBe("process-token");
});

test("rejects invalid environment shapes and ignores empty token values", () => {
  expect(() => loadEnv(undefined, {})).not.toThrow();
  expect(() => loadEnv("", null)).toThrow(/mutable object/);
  expect(() => loadEnv("", [])).toThrow(/mutable object/);
  const environment = {};
  loadEnv('OPENAI_API_TOKEN=""\nOPENAI_API_TOKEN=   ', environment);
  expect(environment).toEqual({});
});
