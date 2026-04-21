import * as assert from "assert";
import { ArchitectureScaffolder } from "../../resource/architecture/ArchitectureScaffolder";
import {
    CLEAN_ARCHITECTURE_SCAFFOLD,
    DDD_SCAFFOLD,
} from "../../resource/architecture/architecture-scaffolds";

describe("ArchitectureScaffolder.buildFrameworkQuickPickItems", () => {
    it("returns only installed frameworks when the SDK probe succeeds", () => {
        const items = ArchitectureScaffolder.buildFrameworkQuickPickItems([
            "net8.0",
            "net6.0",
        ]);
        assert.deepStrictEqual(
            items.map((i) => i.label),
            ["net8.0", "net6.0"]
        );
        assert.ok(
            items[0].description?.includes("recommended"),
            "the highest installed framework should be marked recommended"
        );
        assert.ok(
            items[1].description?.includes("LTS"),
            "net6.0 should be flagged as LTS"
        );
    });

    it("falls back to a sensible default list when no installed SDKs are detected", () => {
        const items = ArchitectureScaffolder.buildFrameworkQuickPickItems([]);
        const labels = items.map((i) => i.label);
        assert.ok(labels.includes("net9.0"));
        assert.ok(labels.includes("net8.0"));
        assert.ok(labels.includes("net6.0"));
    });

    it("never offers a framework that is not in the installed list", () => {
        const items = ArchitectureScaffolder.buildFrameworkQuickPickItems([
            "net6.0",
        ]);
        const labels = items.map((i) => i.label);
        assert.deepStrictEqual(labels, ["net6.0"]);
        assert.ok(!labels.includes("net9.0"));
    });
});

describe("ArchitectureScaffolder.buildCommandSequence", () => {
    it("Clean Architecture emits sln, project create, references and code launch", () => {
        const cmds = ArchitectureScaffolder.buildCommandSequence(
            CLEAN_ARCHITECTURE_SCAFFOLD,
            "Acme",
            "/tmp/Acme",
            "net9.0"
        );

        assert.ok(cmds.length > 0, "expected non-empty command list");
        assert.ok(
            cmds.some((c) => c.includes("dotnet new sln -n Acme")),
            "should create the solution"
        );
        for (const project of CLEAN_ARCHITECTURE_SCAFFOLD.projects) {
            const fullName = `Acme.${project.name}`;
            assert.ok(
                cmds.some((c) =>
                    c.includes(
                        `dotnet new ${project.template} --language c# -n ${fullName}`
                    )
                ),
                `should create ${fullName}`
            );
            assert.ok(
                cmds.some(
                    (c) =>
                        c.includes("dotnet sln") &&
                        c.includes(`${fullName}.csproj`)
                ),
                `should add ${fullName} to the solution`
            );
        }
        assert.ok(
            cmds.some((c) =>
                c.includes(
                    "dotnet add '/tmp/Acme/Acme.WebApi/Acme.WebApi.csproj' reference '/tmp/Acme/Acme.Application/Acme.Application.csproj'"
                ) ||
                    c.includes(
                        "dotnet add '\\tmp\\Acme\\Acme.WebApi\\Acme.WebApi.csproj' reference '\\tmp\\Acme\\Acme.Application\\Acme.Application.csproj'"
                    )
            ) ||
                cmds.some((c) =>
                    c.includes("Acme.WebApi.csproj") &&
                    c.includes("Acme.Application.csproj") &&
                    c.includes("reference")
                ),
            "WebApi should reference Application"
        );
        assert.ok(
            cmds[cmds.length - 1].startsWith("code "),
            "last command should open the new solution in VS Code"
        );
    });

    it("emits a fail-fast guard around every dotnet new + sln add pair so failures don't cascade", () => {
        const cmds = ArchitectureScaffolder.buildCommandSequence(
            CLEAN_ARCHITECTURE_SCAFFOLD,
            "Acme",
            "/tmp/Acme",
            "net6.0"
        );

        const projectChains = cmds.filter(
            (c) => c.includes("dotnet new ") && c.includes("dotnet sln")
        );
        assert.strictEqual(
            projectChains.length,
            CLEAN_ARCHITECTURE_SCAFFOLD.projects.length,
            "every project should have a single chained create+add command"
        );
        for (const chain of projectChains) {
            const isWindows = chain.includes("$LASTEXITCODE");
            const isPosix = chain.includes(" && ") || chain.includes(" || ");
            assert.ok(
                isWindows || isPosix,
                `chained command should fail-fast: ${chain}`
            );
            assert.ok(
                chain.toLowerCase().includes("failed to create"),
                `chained command should print a failure message: ${chain}`
            );
        }
    });

    it("DDD scaffold creates SharedKernel, references it from Domain, and uses requested framework", () => {
        const cmds = ArchitectureScaffolder.buildCommandSequence(
            DDD_SCAFFOLD,
            "Shop",
            "/work/Shop",
            "net8.0"
        );

        assert.ok(
            cmds.some((c) =>
                c.includes("dotnet new classlib --language c# -n Shop.SharedKernel")
            ),
            "should create the SharedKernel project"
        );
        assert.ok(
            cmds.every((c) => !c.includes("net9.0")),
            "should not leak the default framework"
        );
        const refLine = cmds.find(
            (c) =>
                c.includes("Shop.Domain.csproj") &&
                c.includes("Shop.SharedKernel.csproj") &&
                c.includes("reference")
        );
        assert.ok(refLine, "Domain should reference SharedKernel");
    });
});
