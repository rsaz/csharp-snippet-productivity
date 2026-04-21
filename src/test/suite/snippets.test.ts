import { strict as assert } from "assert";
import * as fs from "fs";
import * as path from "path";

const SNIPPETS_DIR = path.resolve(__dirname, "..", "..", "..", "snippets");

interface SnippetEntry {
    prefix?: string | string[];
    body?: string | string[];
    description?: string;
    scope?: string;
}

function loadSnippetFile(name: string): Record<string, SnippetEntry> {
    const filePath = path.join(SNIPPETS_DIR, name);
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
}

describe("snippet files", () => {
    const snippetFiles = [
        "general.json",
        "documentxml.json",
        "designpattern.json",
        "modern.json",
        "patterns.json",
    ];

    snippetFiles.forEach((file) => {
        describe(file, () => {
            let snippets: Record<string, SnippetEntry>;

            before(() => {
                snippets = loadSnippetFile(file);
            });

            it("is valid JSON", () => {
                assert.ok(snippets);
                assert.equal(typeof snippets, "object");
            });

            it("contains at least one snippet", () => {
                assert.ok(Object.keys(snippets).length > 0);
            });

            it("every snippet has a prefix and body", () => {
                for (const [key, entry] of Object.entries(snippets)) {
                    assert.ok(
                        entry.prefix,
                        `snippet '${key}' missing prefix in ${file}`
                    );
                    assert.ok(
                        entry.body,
                        `snippet '${key}' missing body in ${file}`
                    );
                }
            });

            it("every prefix is unique within the file", () => {
                const prefixes = new Set<string>();
                const collisions: string[] = [];
                for (const [key, entry] of Object.entries(snippets)) {
                    const entryPrefixes = Array.isArray(entry.prefix)
                        ? entry.prefix
                        : [entry.prefix as string];
                    for (const p of entryPrefixes) {
                        if (prefixes.has(p)) {
                            collisions.push(`${p} (in ${key})`);
                        } else {
                            prefixes.add(p);
                        }
                    }
                }
                assert.deepEqual(
                    collisions,
                    [],
                    `duplicate prefixes in ${file}`
                );
            });
        });
    });

    describe("modern.json specifics", () => {
        let snippets: Record<string, SnippetEntry>;
        before(() => {
            snippets = loadSnippetFile("modern.json");
        });

        it("contains C# 12 collection expressions", () => {
            assert.ok(snippets["-> Collection Expression"]);
        });

        it("contains C# 12 primary constructor", () => {
            assert.ok(snippets["-> Primary Constructor (Class)"]);
        });

        it("contains C# 11 required property", () => {
            assert.ok(snippets["-> Required Property"]);
        });

        it("contains C# 11 raw string literal", () => {
            assert.ok(snippets["-> Raw String Literal"]);
        });
    });
});
