import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
    analyzeProjects,
    detectCycles,
    readProjectReferences,
} from "../../resource/solutionAnalyzer/solution-analysis";

const CSPROJ_TEMPLATE = (refs: string[]): string => `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
${refs.map((r) => `    <ProjectReference Include="${r}" />`).join("\n")}
  </ItemGroup>
</Project>
`;

interface FixtureProject {
    name: string;
    references?: string[];
}

function buildFixture(projects: FixtureProject[]): {
    root: string;
    paths: Record<string, string>;
} {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "csproj-fixture-"));
    const paths: Record<string, string> = {};
    for (const project of projects) {
        const folder = path.join(root, project.name);
        fs.mkdirSync(folder, { recursive: true });
        paths[project.name] = path.join(folder, `${project.name}.csproj`);
    }
    for (const project of projects) {
        const includeRefs =
            project.references?.map((r) =>
                path.relative(
                    path.dirname(paths[project.name]),
                    paths[r]
                )
            ) ?? [];
        fs.writeFileSync(paths[project.name], CSPROJ_TEMPLATE(includeRefs));
    }
    return { root, paths };
}

describe("solution-analysis", () => {
    it("readProjectReferences resolves Include paths to absolute csproj files", () => {
        const { paths } = buildFixture([
            { name: "Domain" },
            { name: "Application", references: ["Domain"] },
        ]);
        const refs = readProjectReferences(paths.Application);
        assert.strictEqual(refs.length, 1);
        assert.strictEqual(
            path.normalize(refs[0]).toLowerCase(),
            path.normalize(paths.Domain).toLowerCase()
        );
    });

    it("detectCycles flags self-referencing graphs", () => {
        const projects = [
            {
                path: "/proj/A/A.csproj",
                name: "A",
                references: ["/proj/B/B.csproj"],
            },
            {
                path: "/proj/B/B.csproj",
                name: "B",
                references: ["/proj/A/A.csproj"],
            },
        ];
        const cycles = detectCycles(projects);
        assert.strictEqual(cycles.length, 1, "expected exactly one cycle");
        assert.ok(cycles[0].includes("A") && cycles[0].includes("B"));
    });

    it("analyzeProjects reports empty cycles + orphans for a clean Clean Architecture-like graph", () => {
        const { paths } = buildFixture([
            { name: "Domain" },
            { name: "Application", references: ["Domain"] },
            { name: "Infrastructure", references: ["Application"] },
            {
                name: "WebApi",
                references: ["Application", "Infrastructure"],
            },
        ]);
        const analysis = analyzeProjects(Object.values(paths));
        assert.strictEqual(analysis.cycles.length, 0);
        assert.strictEqual(analysis.orphanReferences.length, 0);
        assert.strictEqual(analysis.projects.length, 4);
    });

    it("analyzeProjects reports orphan references for projects not in the input list", () => {
        const { paths } = buildFixture([
            { name: "Application" },
            { name: "WebApi", references: ["Application"] },
        ]);
        const analysis = analyzeProjects([paths.WebApi]);
        assert.strictEqual(analysis.orphanReferences.length, 1);
        assert.strictEqual(analysis.orphanReferences[0].from, "WebApi");
    });
});
