import * as assert from "assert";
import { PATTERN_TEMPLATES } from "../../resource/codeActions/pattern-templates";

describe("PATTERN_TEMPLATES", () => {
    it("contains the seven canonical architectural patterns", () => {
        const ids = PATTERN_TEMPLATES.map((t) => t.id);
        for (const expected of [
            "result",
            "option",
            "repository",
            "cqrs",
            "specification",
            "builder",
            "unitofwork",
        ]) {
            assert.ok(
                ids.includes(expected),
                `missing pattern template '${expected}'`
            );
        }
    });

    it("every template ships with a non-empty body and an Insert: title", () => {
        for (const template of PATTERN_TEMPLATES) {
            assert.ok(template.title.startsWith("Insert: "), template.id);
            assert.ok(template.body.trim().length > 0, template.id);
        }
    });

    it("template ids are unique", () => {
        const ids = PATTERN_TEMPLATES.map((t) => t.id);
        assert.strictEqual(ids.length, new Set(ids).size);
    });
});
