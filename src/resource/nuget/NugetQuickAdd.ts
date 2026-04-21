import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { CONFIG_KEYS, EXTENSION_ID } from "../../utils/constants";
import { Logger } from "../../utils/logger";

interface PackagePickItem extends vscode.QuickPickItem {
    packageId: string;
}

/**
 * "C# Toolbox: Quick Add NuGet Package" command implementation.
 *
 * Surfaces a curated list of popular .NET packages (configurable via the
 * `csharp-snippet-productivity.nuget.popularPackages` setting), prompts the
 * user to pick a `.csproj` from the workspace, and runs `dotnet add package`
 * in a dedicated terminal.
 */
export class NugetQuickAdd {
    /**
     * Entry point invoked by VS Code when the command is executed.
     *
     * @param uri - Optional URI passed by the explorer context menu. When the
     *   URI points at (or sits inside) a folder containing a `.csproj`, that
     *   project is preselected.
     */
    public static async run(uri?: vscode.Uri): Promise<void> {
        const pkg = await NugetQuickAdd.pickPackage();
        if (!pkg) {
            return;
        }

        const csproj = await NugetQuickAdd.pickCsproj(uri);
        if (!csproj) {
            return;
        }

        const version = await vscode.window.showInputBox({
            prompt: `Optional version for ${pkg} (leave blank for latest)`,
            placeHolder: "e.g. 8.0.0",
        });
        if (version === undefined) {
            return;
        }

        const versionFlag = version.trim() ? ` --version ${version.trim()}` : "";
        const cmd = `dotnet add '${csproj}' package ${pkg}${versionFlag}`;

        Logger.info(`Running: ${cmd}`);
        const terminal = vscode.window.createTerminal("C# Toolbox: NuGet");
        terminal.show();
        terminal.sendText(cmd);
    }

    /**
     * Visible for testing — derives the QuickPick items from the configured
     * popular-packages list.
     */
    public static parsePackageList(raw: string[]): PackagePickItem[] {
        const items: PackagePickItem[] = [];
        for (const entry of raw) {
            const colonIdx = entry.indexOf(":");
            const packageId =
                colonIdx >= 0
                    ? entry.slice(0, colonIdx).trim()
                    : entry.trim();
            const description =
                colonIdx >= 0 ? entry.slice(colonIdx + 1).trim() : "";
            if (!packageId) {
                continue;
            }
            items.push({
                label: packageId,
                description,
                packageId,
            });
        }
        return items;
    }

    private static async pickPackage(): Promise<string | undefined> {
        const config = vscode.workspace.getConfiguration(EXTENSION_ID);
        const raw =
            config.get<string[]>(CONFIG_KEYS.NUGET_POPULAR_PACKAGES) ?? [];
        const items = NugetQuickAdd.parsePackageList(raw);

        const customLabel = "$(edit) Type a custom package id…";
        const choice = await vscode.window.showQuickPick(
            [
                { label: customLabel, packageId: "" } as PackagePickItem,
                ...items,
            ],
            {
                placeHolder: "Pick a NuGet package to add",
                matchOnDescription: true,
            }
        );
        if (!choice) {
            return undefined;
        }
        if (choice.label === customLabel) {
            return vscode.window.showInputBox({
                prompt: "NuGet package id",
                placeHolder: "e.g. Newtonsoft.Json",
                validateInput: (value) =>
                    value.trim().length === 0 ? "Required" : null,
            });
        }
        return choice.packageId;
    }

    private static async pickCsproj(
        hint?: vscode.Uri
    ): Promise<string | undefined> {
        const candidates = await NugetQuickAdd.findCsprojFiles();
        if (candidates.length === 0) {
            vscode.window.showWarningMessage(
                "No .csproj files found in the open workspace."
            );
            return undefined;
        }

        const hinted = NugetQuickAdd.matchHint(hint, candidates);
        if (hinted) {
            return hinted;
        }

        if (candidates.length === 1) {
            return candidates[0];
        }

        const pick = await vscode.window.showQuickPick(
            candidates.map((p) => ({
                label: path.basename(p),
                description: vscode.workspace.asRelativePath(p),
                csproj: p,
            })),
            { placeHolder: "Choose the project to update" }
        );
        return pick?.csproj;
    }

    private static async findCsprojFiles(): Promise<string[]> {
        const found = await vscode.workspace.findFiles(
            "**/*.csproj",
            "**/{node_modules,bin,obj}/**"
        );
        return found.map((u) => u.fsPath);
    }

    private static matchHint(
        hint: vscode.Uri | undefined,
        candidates: string[]
    ): string | undefined {
        if (!hint) {
            return undefined;
        }
        const hintPath = hint.fsPath;
        try {
            const stat = fs.statSync(hintPath);
            const folder = stat.isDirectory()
                ? hintPath
                : path.dirname(hintPath);
            return candidates.find(
                (c) => path.dirname(c).toLowerCase() === folder.toLowerCase()
            );
        } catch {
            return undefined;
        }
    }
}
