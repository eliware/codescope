import { loadEnv } from "../../src/review/dotenv-parser.mjs";

test("loads the supported token from dotenv text", () => {
  const environment = {};
  loadEnv('export OPENAI_API_TOKEN="secret"', environment);
  expect(environment.OPENAI_API_TOKEN).toBe("secret");
});

test("ignores comments, blanks, and already-populated values", () => {
  const environment = { OPENAI_API_TOKEN: "existing" };
  loadEnv(
    "\n# comment\nOPENAI_API_TOKEN=ignored\nOTHER=value\nlowercase=value\nMixed_Name=value",
    environment,
  );
  expect(environment).toEqual({ OPENAI_API_TOKEN: "existing" });
});

test("ignores malformed lines unrelated to the supported token", () => {
  const environment = {};
  loadEnv("not dotenv\nOTHER VALUE\nOPENAI_API_TOKEN=file-token", environment);
  expect(environment).toEqual({ OPENAI_API_TOKEN: "file-token" });
});

test("decodes quoted values and inline comments", () => {
  const environment = {};
  loadEnv('OPENAI_API_TOKEN="line\\nnext\\tvalue"', environment);
  expect(environment.OPENAI_API_TOKEN).toBe("line\nnext\tvalue");
  loadEnv("OPENAI_API_TOKEN='secret'", {});
  loadEnv("OPENAI_API_TOKEN=secret # ignored", {});
  const quotedComment = {};
  loadEnv('OPENAI_API_TOKEN="secret" # ignored', quotedComment);
  expect(quotedComment.OPENAI_API_TOKEN).toBe("secret");
});

test("rejects malformed token assignments and quoted token values", () => {
  expect(() => loadEnv("OPENAI_API_TOKEN without equals", {})).toThrow(/Invalid \.env line/);
  expect(() => loadEnv('OPENAI_API_TOKEN="unterminated', {})).toThrow(/Invalid quoted/);
  expect(() => loadEnv("OPENAI_API_TOKEN='unterminated", {})).toThrow(/Invalid quoted/);
});

test("validates quoted token syntax even when the process already has a token", () => {
  const environment = { OPENAI_API_TOKEN: "process-token" };
  expect(() => loadEnv('OPENAI_API_TOKEN="unterminated', environment)).toThrow(/Invalid quoted/);
  expect(() => loadEnv("OPENAI_API_TOKEN without equals", environment)).toThrow(
    /Invalid \.env line/,
  );
});

test("rejects non-comment text after a quoted token value", () => {
  expect(() => loadEnv('OPENAI_API_TOKEN="secret"junk', {})).toThrow(/Invalid quoted/);
});

test("rejects immutable environment shapes and ignores empty values", () => {
  expect(() => loadEnv(undefined, {})).not.toThrow();
  expect(() => loadEnv("", null)).toThrow(/mutable object/);
  expect(() => loadEnv("", [])).toThrow(/mutable object/);
  const environment = {};
  loadEnv('OPENAI_API_TOKEN=""\nOPENAI_API_TOKEN=   ', environment);
  expect(environment).toEqual({});
});
