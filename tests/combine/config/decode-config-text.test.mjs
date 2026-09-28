import { decodeConfigText } from "../../../src/combine/config/decode-config-text.mjs";

test("decodes UTF-8 and omits incomplete characters at the sample boundary", () => {
  expect(decodeConfigText(Buffer.from("plain"), false, "config.yml")).toBe("plain");
  const bytes = Buffer.concat([Buffer.alloc(99_999, 0x61), Buffer.from([0xc3])]);
  expect(decodeConfigText(bytes, true, "config.yml")).toBe("a".repeat(99_999));
});

test("rejects malformed UTF-8 with the configuration path", () => {
  expect(() => decodeConfigText(Buffer.from([0x61, 0xc3, 0x28]), false, ".github/ci.yml")).toThrow(
    "configuration file is not valid UTF-8: .github/ci.yml",
  );
});
