import { readStringProperty } from "../../../src/review/response-accessors/read-string-property.mjs";

test("reads optional strings once and ignores non-string values", () => {
  let reads = 0;
  const response = {
    get output_text() {
      reads += 1;
      if (reads > 1) throw new Error("read twice");
      return "first read";
    },
  };
  expect(readStringProperty(response, "output_text")).toBe("first read");
  expect(reads).toBe(1);
  expect(readStringProperty({ output_text: 42 }, "output_text")).toBeUndefined();
});

test("returns absent when reading a getter throws", () => {
  const response = Object.defineProperty({}, "output_text", {
    get: () => {
      throw new Error("bad");
    },
  });
  expect(readStringProperty(response, "output_text")).toBeUndefined();
});
