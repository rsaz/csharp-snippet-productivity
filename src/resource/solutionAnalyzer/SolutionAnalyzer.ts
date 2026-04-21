import * as vscode from "vscode";
import * as path from "path";
import { Logger } from "../../utils/logger";
import {
    SolutionAnalysis,
    analyzeProjects,
} from "./solution-analysis";

/**
 * "C# Toolbox: Analyze Solution" command implementation.
 *
 * Walks every `.csproj` in the open workspace, prints a project-reference
 * graph to the **C# Toolbox** Output channel, and warns about cycles or
 * orphan references.
 */
export class SolutionAnalyzer {
    /** Entry point invoked by VS Code when the command is executed. */
    public static async run(): Promise<void> {
        const csprojUris = await vscode.workspace.findFiles(
            "**/*.csproj",
            "**/{node_modules,bin,obj}/**"
        );
        if (csprojUris.length === 0) {
            vscode.window.showWarningMessage(
                "No .csproj files found in the open workspace."
            );
            return;
        }

        const csprojPaths = csprojUris.map((u) => u.fsPath);
        Logger.info(
            `Analyzing ${csprojPaths.length} project file(s)...`
        );
        const analysis = analyzeProjects(csprojPaths);

        SolutionAnalyzer.report(analysis);

        if (analysis.cycles.length > 0) {
            vscode.window.showErrorMessage(
                `Solution analyzer: ${analysis.cycles.length} circular dependency(s) detected — see the C# Toolbox output channel.`
            );
        } else if (analysis.orphanReferences.length > 0) {
            vscode.window.showWarningMessage(
                `Solution analyzer: ${analysis.orphanReferences.length} orphan reference(s) — see the C# Toolbox output channel.`
            );
        } else {
            vscode.window.showInformationMessage(
                `Solution analyzer: ${analysis.projects.length} project(s), no cycles found.`
            );
        }
    }

    private static report(analysis: SolutionAnalysis): void {
        Logger.info("");
        Logger.info("=== Solution analysis ===");
        Logger.info(`Projects: ${analysis.projects.length}`);
        for (const project of analysis.projects) {
            const refs =
                project.references.length === 0
                    ? "(no project references)"
                    : project.references
                          .map((r) => path.basename(r, path.extname(r)))
                          .join(", ");
            Logger.info(`  - ${project.name}  ->  ${refs}`);
        }

        if (analysis.cycles.length > 0) {
            Logger.warn(
                `Cycles detected (${analysis.cycles.length}):`
            );
            for (const cycle of analysis.cycles) {
                Logger.warn(`  ! ${cycle.join(" -> ")}`);
            }
        } else {
            Logger.info("No circular dependencies detected.");
        }

        if (analysis.orphanReferences.length > 0) {
            Logger.warn(
                `Orphan references (target project not in workspace, ${analysis.orphanReferences.length}):`
            );
            for (const orphan of analysis.orphanReferences) {
                Logger.warn(
                    `  ? ${orphan.from} -> ${orphan.missingPath}`
                );
            }
        }
        Logger.info("=========================");
    }
}
