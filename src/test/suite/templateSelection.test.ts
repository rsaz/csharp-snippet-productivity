import { strict as assert } from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
    parseTargetFramework,
    isModernFramework,
    selectTemplateFile,
    readTargetFrameworkFromCsproj,
} from "../../resource/contextualMenu/template-selection";

describe("template-selection", () => {
    describe("parseTargetFramework", () => {
        it("reads <TargetFramework> for a single-target csproj", () => {
            const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>`;
            assert.equal(parseTargetFramework(xml), "net8.0");
        });

        it("reads the first entry from <TargetFrameworks>", () => {
            const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFrameworks>net8.0;net9.0;netstandard2.0</TargetFrameworks>
  </PropertyGroup>
</Project>`;
            assert.equal(parseTargetFramework(xml), "net8.0");
        });

        it("returns undefined when neither tag is present", () => {
            const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>`;
            assert.equal(parseTargetFramework(xml), undefined);
        });

        it("trims whitespace around the moniker", () => {
            const xml = `<TargetFramework>   net6.0  </TargetFramework>`;
            assert.equal(parseTargetFramework(xml), "net6.0");
        });
    });

    describe("isModernFramework", () => {
        it("returns true for .NET 6 and later", () => {
            for (const tfm of ["net6.0", "net7.0", "net8.0", "net9.0"]) {
                assert.equal(isModernFramework(tfm), true, `${tfm} should be modern`);
            }
        });

        it("returns false for legacy frameworks", () => {
            const legacy = [
                "net5.0",
                "netcoreapp3.1",
                "netstandard2.0",
                "netstandard2.1",
                "net48",
            ];
            for (const tfm of legacy) {
                assert.equal(
                    isModernFramework(tfm),
                    false,
                    `${tfm} should be legacy`
                );
            }
        });

        it("returns false for undefined / unknown", () => {
            assert.equal(isModernFramework(undefined), false);
            assert.equal(isModernFramework(""), false);
            assert.equal(isModernFramework("garbage"), false);
        });
    });

    describe("selectTemplateFile", () => {
        it("uses *-modern.mdl on .NET 6+", () => {
            assert.equal(
                selectTemplateFile("class", "net8.0"),
                "class-modern.mdl"
            );
            assert.equal(
                selectTemplateFile("interface", "net6.0"),
                "interface-modern.mdl"
            );
            assert.equal(
                selectTemplateFile("record", "net9.0"),
                "record-modern.mdl"
            );
            assert.equal(
                selectTemplateFile("struct", "net7.0"),
                "struct-modern.mdl"
            );
        });

        it("uses legacy *.mdl on net5.0 and earlier", () => {
            assert.equal(selectTemplateFile("class", "net5.0"), "class.mdl");
            assert.equal(
                selectTemplateFile("interface", "netcoreapp3.1"),
                "interface.mdl"
            );
            assert.equal(
                selectTemplateFile("record", "netstandard2.1"),
                "record.mdl"
            );
        });

        it("falls back to legacy when framework is unknown", () => {
            assert.equal(selectTemplateFile("class", undefined), "class.mdl");
            assert.equal(selectTemplateFile("struct", ""), "struct.mdl");
        });
    });

    describe("readTargetFrameworkFromCsproj", () => {
        it("reads from disk", () => {
            const tmpDir = fs.mkdtempSync(
                path.join(os.tmpdir(), "csharp-toolbox-")
            );
            const csproj = path.join(tmpDir, "Acme.csproj");
            fs.writeFileSync(
                csproj,
                `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>`,
                "utf8"
            );
            try {
                assert.equal(readTargetFrameworkFromCsproj(csproj), "net8.0");
            } finally {
                fs.unlinkSync(csproj);
                fs.rmdirSync(tmpDir);
            }
        });

        it("returns undefined for a missing file", () => {
            assert.equal(
                readTargetFrameworkFromCsproj(
                    path.join(os.tmpdir(), "definitely-not-here.csproj")
                ),
                undefined
            );
        });
    });
});
