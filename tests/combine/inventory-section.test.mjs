import { collectInventorySection } from "../../src/combine/inventory-section.mjs";

test("assembles the names-and-sizes inventory section", async () => {
  await expect(collectInventorySection(process.cwd(), [], { maxChars: 100 })).resolves.toBe(
    "===== other files (names and sizes only) =====\n\n",
  );
});
