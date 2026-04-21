import { strict as assert } from "assert";
import {
    projectTemplateGroups,
    getAllTemplates,
    getTemplatesByGroup,
    getTemplateByShortName,
} from "../../utils/project-templates";

describe("project-templates utilities", () => {
    describe("getAllTemplates", () => {
        it("returns a non-empty list of templates", () => {
            const all = getAllTemplates();
            assert.ok(all.length > 0, "expected at least one template");
        });

        it("returns the same total as the sum of group sizes", () => {
            const all = getAllTemplates();
            const expected = projectTemplateGroups.reduce(
                (sum, g) => sum + g.templates.length,
                0
            );
            assert.equal(all.length, expected);
        });

        it("includes the .NET 9 worker service template", () => {
            const all = getAllTemplates();
            const worker = all.find((t) => t.shortName === "worker");
            assert.ok(worker, "worker template should be registered");
            assert.equal(worker?.templateName, "Worker Service");
        });

        it("includes the .NET Aspire templates", () => {
            const all = getAllTemplates();
            assert.ok(all.find((t) => t.shortName === "aspire"));
            assert.ok(all.find((t) => t.shortName === "aspire-starter"));
        });
    });

    describe("getTemplatesByGroup", () => {
        it("returns templates for a known group", () => {
            const apis = getTemplatesByGroup("api");
            assert.ok(apis.length > 0);
            assert.ok(apis.find((t) => t.shortName === "webapi"));
        });

        it("returns empty array for unknown group", () => {
            const result = getTemplatesByGroup("nonexistent-group");
            assert.deepEqual(result, []);
        });
    });

    describe("getTemplateByShortName", () => {
        it("finds a template by short name", () => {
            const tpl = getTemplateByShortName("console");
            assert.ok(tpl);
            assert.equal(tpl?.shortName, "console");
        });

        it("returns undefined for unknown short name", () => {
            const tpl = getTemplateByShortName("does-not-exist");
            assert.equal(tpl, undefined);
        });
    });

    describe("project template groups", () => {
        it("contains the cloud group", () => {
            const cloud = projectTemplateGroups.find((g) => g.name === "cloud");
            assert.ok(cloud, "cloud group should exist");
            assert.equal(cloud?.displayName, "Cloud");
        });

        it("each template has required fields", () => {
            for (const group of projectTemplateGroups) {
                for (const tpl of group.templates) {
                    assert.ok(
                        tpl.templateName && typeof tpl.templateName === "string",
                        `template missing name in group ${group.name}`
                    );
                    assert.ok(
                        tpl.shortName && typeof tpl.shortName === "string",
                        `template missing shortName in group ${group.name}`
                    );
                }
            }
        });
    });
});
