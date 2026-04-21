/**
 * Pure analysis utilities for `.csproj` files. Kept free of `vscode` so they
 * can be exercised by Mocha unit tests in plain Node.
 */
import * as fs from "fs";
import * as path from "path";

export interface ProjectNode {
    /** Absolute `.csproj` path. */
    path: string;
    /** File-name without extension (e.g. `MyApp.Domain`). */
    name: string;
    /** Absolute paths of every project this project references. */
    references: string[];
}

export interface SolutionAnalysis {
    projects: ProjectNode[];
    /** Each cycle is the ordered list of project names that form the loop. */
    cycles: string[][];
    /** Project names referenced via `<ProjectReference>` but not found on disk. */
    orphanReferences: { from: string; missingPath: string }[];
}

const PROJECT_REFERENCE_REGEX =
    /<ProjectReference\s+[^>]*Include\s*=\s*"([^"]+)"/gi;

/**
 * Reads a single `.csproj` file and returns the absolute paths of every
 * `<ProjectReference Include="…">`. The returned paths preserve the on-disk
 * casing so analysis stays consistent across operating systems.
 */
export function readProjectReferences(csprojPath: string): string[] {
    const xml = fs.readFileSync(csprojPath, "utf8");
    const projectDir = path.dirname(csprojPath);
    const refs: string[] = [];
    let match: RegExpExecArray | null;
    PROJECT_REFERENCE_REGEX.lastIndex = 0;
    while ((match = PROJECT_REFERENCE_REGEX.exec(xml)) !== null) {
        const includeRaw = match[1].replace(/\\/g, path.sep).replace(/\//g, path.sep);
        const absolute = path.resolve(projectDir, includeRaw);
        refs.push(absolute);
    }
    return refs;
}

/**
 * Builds the full {@link SolutionAnalysis} for a given list of `.csproj`
 * paths. References that point to projects not in the list are reported via
 * `orphanReferences`.
 */
export function analyzeProjects(csprojPaths: string[]): SolutionAnalysis {
    const normalised = csprojPaths.map((p) => path.normalize(p));
    const known = new Set(normalised.map((p) => p.toLowerCase()));

    const projects: ProjectNode[] = normalised.map((p) => {
        const references = fs.existsSync(p) ? readProjectReferences(p) : [];
        return {
            path: p,
            name: path.basename(p, path.extname(p)),
            references,
        };
    });

    const orphanReferences: SolutionAnalysis["orphanReferences"] = [];
    for (const project of projects) {
        for (const ref of project.references) {
            if (!known.has(path.normalize(ref).toLowerCase())) {
                orphanReferences.push({
                    from: project.name,
                    missingPath: ref,
                });
            }
        }
    }

    return {
        projects,
        cycles: detectCycles(projects),
        orphanReferences,
    };
}

/**
 * Detects every dependency cycle in a project graph using an iterative DFS.
 *
 * Visible for testing.
 */
export function detectCycles(projects: ProjectNode[]): string[][] {
    const keyOf = (p: string): string => path.normalize(p).toLowerCase();
    const byPath = new Map<string, ProjectNode>();
    for (const project of projects) {
        byPath.set(keyOf(project.path), project);
    }

    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();
    /** Parallel walk stack: keys for membership, names for cycle output. */
    const walkKeys: string[] = [];
    const walkNames: string[] = [];

    const visit = (project: ProjectNode): void => {
        const key = keyOf(project.path);
        if (stack.has(key)) {
            const startIdx = walkKeys.indexOf(key);
            if (startIdx >= 0) {
                cycles.push([
                    ...walkNames.slice(startIdx),
                    project.name,
                ]);
            }
            return;
        }
        if (visited.has(key)) {
            return;
        }
        visited.add(key);
        stack.add(key);
        walkKeys.push(key);
        walkNames.push(project.name);
        for (const ref of project.references) {
            const next = byPath.get(keyOf(ref));
            if (next) {
                visit(next);
            }
        }
        stack.delete(key);
        walkKeys.pop();
        walkNames.pop();
    };

    for (const project of projects) {
        visit(project);
    }

    return dedupeCycles(cycles);
}

function dedupeCycles(cycles: string[][]): string[][] {
    const seen = new Set<string>();
    const result: string[][] = [];
    for (const cycle of cycles) {
        const key = canonicalCycleKey(cycle);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(cycle);
        }
    }
    return result;
}

function canonicalCycleKey(cycle: string[]): string {
    if (cycle.length === 0) {
        return "";
    }
    const trimmed = cycle.slice(0, cycle.length - 1);
    let minIdx = 0;
    for (let i = 1; i < trimmed.length; i++) {
        if (trimmed[i] < trimmed[minIdx]) {
            minIdx = i;
        }
    }
    const rotated = [...trimmed.slice(minIdx), ...trimmed.slice(0, minIdx)];
    return rotated.join(" -> ");
}
