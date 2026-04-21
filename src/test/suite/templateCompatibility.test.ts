import { strict as assert } from "assert";
import { TEMPLATE_COMPATIBILITY } from "../../utils/terminal-cmd.provider";

describe("TEMPLATE_COMPATIBILITY map", () => {
    it("includes .NET 9.0 in modern templates", () => {
        const modernTemplates = [
            "console",
            "classlib",
            "webapi",
            "mvc",
            "blazor",
            "worker",
            "xunit",
            "mstest",
            "nunit",
        ];

        for (const tpl of modernTemplates) {
            const frameworks = TEMPLATE_COMPATIBILITY[tpl];
            assert.ok(
                frameworks,
                `template '${tpl}' missing from compatibility map`
            );
            assert.ok(
                frameworks.includes("net9.0"),
                `template '${tpl}' should support net9.0`
            );
        }
    });

    it("includes .NET Aspire entries", () => {
        assert.ok(TEMPLATE_COMPATIBILITY["aspire"]);
        assert.ok(TEMPLATE_COMPATIBILITY["aspire-starter"]);
        assert.ok(TEMPLATE_COMPATIBILITY["aspire"].includes("net9.0"));
    });

    it("does not include .NET 9.0 for legacy-only templates", () => {
        const legacyOnly = TEMPLATE_COMPATIBILITY["console-framework"];
        assert.ok(legacyOnly);
        assert.ok(!legacyOnly.includes("net9.0"));
        assert.ok(legacyOnly.some((f) => f.startsWith("net4")));
    });

    it("every framework entry follows the netX.Y format", () => {
        const frameworkRegex = /^(net\d+(\.\d+)?|netcoreapp\d+\.\d+|netstandard\d+\.\d+)$/;
        for (const [tpl, frameworks] of Object.entries(TEMPLATE_COMPATIBILITY)) {
            for (const fw of frameworks) {
                assert.ok(
                    frameworkRegex.test(fw),
                    `'${fw}' (in template '${tpl}') is not a valid framework moniker`
                );
            }
        }
    });

    it("classlib supports both netstandard variants", () => {
        const classlib = TEMPLATE_COMPATIBILITY["classlib"];
        assert.ok(classlib.includes("netstandard2.0"));
        assert.ok(classlib.includes("netstandard2.1"));
    });
});
