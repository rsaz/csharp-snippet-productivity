import * as assert from "assert";
import { NugetQuickAdd } from "../../resource/nuget/NugetQuickAdd";

describe("NugetQuickAdd.parsePackageList", () => {
    it("splits package id and description on the first colon", () => {
        const items = NugetQuickAdd.parsePackageList([
            "Serilog: Structured logging",
            "Polly: Resilience: and retries",
        ]);
        assert.strictEqual(items.length, 2);
        assert.strictEqual(items[0].label, "Serilog");
        assert.strictEqual(items[0].description, "Structured logging");
        assert.strictEqual(items[1].label, "Polly");
        assert.strictEqual(items[1].description, "Resilience: and retries");
    });

    it("falls back to the whole entry as id when no colon is present", () => {
        const items = NugetQuickAdd.parsePackageList(["Newtonsoft.Json"]);
        assert.strictEqual(items.length, 1);
        assert.strictEqual(items[0].label, "Newtonsoft.Json");
        assert.strictEqual(items[0].description, "");
    });

    it("skips empty / whitespace-only entries", () => {
        const items = NugetQuickAdd.parsePackageList([
            "",
            "   ",
            ": only description",
            "ValidPackage: ok",
        ]);
        assert.deepStrictEqual(
            items.map((i) => i.label),
            ["ValidPackage"]
        );
    });
});
