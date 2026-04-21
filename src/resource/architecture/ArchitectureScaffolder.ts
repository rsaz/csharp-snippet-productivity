import * as vscode from "vscode";
import * as path from "path";
import { Logger } from "../../utils/logger";
import { getInstalledTargetFrameworks } from "../../utils/sdk.provider";
import { LTS_FRAMEWORKS, RECOMMENDED_FRAMEWORKS } from "../../utils/constants";

/**
 * Description of a single project that should be created as part of a
 * multi-project architecture scaffold.
 */
export interface ProjectSpec {
    /** Project folder name (also used for the `.csproj` file). */
    name: string;
    /** `dotnet new` template short name (e.g. `classlib`, `webapi`). */
    template: string;
    /** Optional list of project names this project should reference. */
    references?: string[];
    /** Optional list of NuGet packages to add (`<package>[@<version>]`). */
    packages?: string[];
}

/**
 * Description of a multi-project architecture scaffold (Clean Architecture,
 * DDD, etc.). The {@link ArchitectureScaffolder} consumes one of these and
 * produces a series of `dotnet` CLI commands in a VS Code terminal.
 */
export interface ArchitectureScaffold {
    /** Human-friendly name shown to the user. */
    label: string;
    /** Short description shown in the picker. */
    description: string;
    /** List of projects to create (order matters for references). */
    projects: ProjectSpec[];
    /** Optional folder names to create under each project after scaffolding. */
    extraFolders?: Record<string, string[]>;
}

const FALLBACK_FRAMEWORKS: readonly string[] = [
    "net9.0",
    "net8.0",
    "net7.0",
    "net6.0",
];

const PROJECT_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_.]*$/;

/**
 * Orchestrates the creation of a multi-project .NET architecture by emitting
 * `dotnet` CLI commands to a VS Code terminal.
 */
export class ArchitectureScaffolder {
    /**
     * Prompts the user for solution name, target framework, and parent folder,
     * then scaffolds the supplied {@link ArchitectureScaffold}.
     */
    public static async scaffold(
        scaffold: ArchitectureScaffold
    ): Promise<void> {
        const solutionName = await ArchitectureScaffolder.askSolutionName(
            scaffold.label
        );
        if (!solutionName) {
            return;
        }

        const framework = await ArchitectureScaffolder.askFramework();
        if (!framework) {
            return;
        }

        const parentFolder = await ArchitectureScaffolder.askParentFolder();
        if (!parentFolder) {
            return;
        }

        const solutionPath = path.join(parentFolder, solutionName);
        Logger.info(
            `Scaffolding ${scaffold.label} solution '${solutionName}' at '${solutionPath}' (${framework})`
        );

        const terminal = vscode.window.createTerminal(
            `C# Toolbox: ${scaffold.label}`
        );
        terminal.show();

        const commands = ArchitectureScaffolder.buildCommandSequence(
            scaffold,
            solutionName,
            solutionPath,
            framework
        );

        for (const cmd of commands) {
            terminal.sendText(cmd);
        }

        vscode.window.showInformationMessage(
            `${scaffold.label} solution '${solutionName}' is being scaffolded — see the terminal for progress.`
        );
    }

    private static async askSolutionName(
        label: string
    ): Promise<string | undefined> {
        return vscode.window.showInputBox({
            prompt: `Solution name for the ${label} scaffold`,
            placeHolder: "MyCompany.MyProduct",
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return "Solution name is required.";
                }
                if (!PROJECT_NAME_PATTERN.test(value.trim())) {
                    return "Use letters, digits, dots and underscores only; must start with a letter or underscore.";
                }
                return null;
            },
        });
    }

    private static async askFramework(): Promise<string | undefined> {
        const installed = await getInstalledTargetFrameworks();
        const items = ArchitectureScaffolder.buildFrameworkQuickPickItems(
            installed
        );
        if (items.length === 0) {
            const action = await vscode.window.showErrorMessage(
                "No .NET SDK detected. Install the .NET SDK and try again.",
                "Open download page"
            );
            if (action === "Open download page") {
                vscode.env.openExternal(
                    vscode.Uri.parse("https://dotnet.microsoft.com/download")
                );
            }
            return undefined;
        }
        const pick = await vscode.window.showQuickPick(items, {
            placeHolder:
                installed.length > 0
                    ? "Target framework (only your installed SDKs are listed)"
                    : "Target framework",
        });
        return pick?.label;
    }

    /**
     * Builds the QuickPick items for the framework picker.
     *
     * - When `installed` is non-empty, only those frameworks are offered.
     * - When `installed` is empty (detection failed), falls back to the
     *   {@link FALLBACK_FRAMEWORKS} list so the command remains usable.
     * - Marks the highest installed framework with ★ ("recommended") and
     *   appends "LTS" to long-term-support releases.
     *
     * Visible for testing.
     */
    public static buildFrameworkQuickPickItems(
        installed: readonly string[]
    ): vscode.QuickPickItem[] {
        const list = installed.length > 0 ? installed : FALLBACK_FRAMEWORKS;
        return list.map((moniker, index) => {
            const labels: string[] = [];
            if (
                index === 0 ||
                (RECOMMENDED_FRAMEWORKS as readonly string[]).includes(moniker)
            ) {
                labels.push("★ recommended");
            }
            if ((LTS_FRAMEWORKS as readonly string[]).includes(moniker)) {
                labels.push("LTS");
            }
            return {
                label: moniker,
                description: labels.join(" · "),
            } satisfies vscode.QuickPickItem;
        });
    }

    private static async askParentFolder(): Promise<string | undefined> {
        const folders = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Select parent folder",
        });
        return folders?.[0]?.fsPath;
    }

    /**
     * Builds the ordered list of shell commands that, when executed in a
     * single terminal, scaffolds the architecture.
     *
     * The output is fail-fast: if any `dotnet new` step fails, the matching
     * `dotnet sln add` / package / reference steps for the same project are
     * skipped and a clear error line is printed instead. This is achieved
     * via shell-native chaining (`if ($?)` on Windows PowerShell, `&&` on
     * POSIX shells) so we don't need a wrapper script on disk.
     *
     * Visible for testing.
     */
    public static buildCommandSequence(
        scaffold: ArchitectureScaffold,
        solutionName: string,
        solutionPath: string,
        framework: string
    ): string[] {
        const commands: string[] = [];
        const slnFile = `'${path.join(
            solutionPath,
            `${solutionName}.sln`
        )}'`;

        commands.push(
            ArchitectureScaffolder.mkdir(solutionPath),
            ArchitectureScaffolder.guard(
                `dotnet new sln -n ${solutionName} -o '${solutionPath}' --force`,
                "create solution"
            )
        );

        for (const project of scaffold.projects) {
            const fullName = `${solutionName}.${project.name}`;
            const projectFolder = path.join(solutionPath, fullName);
            const csproj = `'${path.join(projectFolder, `${fullName}.csproj`)}'`;

            commands.push(ArchitectureScaffolder.mkdir(projectFolder));

            const newCmd = `dotnet new ${project.template} --language c# -n ${fullName} -o '${projectFolder}' --framework ${framework} --force`;
            const slnAdd = `dotnet sln ${slnFile} add ${csproj}`;
            commands.push(
                ArchitectureScaffolder.chain(
                    [newCmd, slnAdd],
                    `create ${fullName}`
                )
            );

            for (const folder of scaffold.extraFolders?.[project.name] ?? []) {
                commands.push(
                    ArchitectureScaffolder.mkdir(
                        path.join(projectFolder, folder)
                    )
                );
            }

            for (const pkg of project.packages ?? []) {
                const [id, version] = pkg.split("@");
                const versionFlag = version ? ` --version ${version}` : "";
                commands.push(
                    ArchitectureScaffolder.guard(
                        `dotnet add ${csproj} package ${id}${versionFlag}`,
                        `add ${id} to ${fullName}`
                    )
                );
            }
        }

        for (const project of scaffold.projects) {
            for (const reference of project.references ?? []) {
                const fromCsproj = `'${path.join(
                    solutionPath,
                    `${solutionName}.${project.name}`,
                    `${solutionName}.${project.name}.csproj`
                )}'`;
                const toCsproj = `'${path.join(
                    solutionPath,
                    `${solutionName}.${reference}`,
                    `${solutionName}.${reference}.csproj`
                )}'`;
                commands.push(
                    ArchitectureScaffolder.guard(
                        `dotnet add ${fromCsproj} reference ${toCsproj}`,
                        `reference ${reference} from ${project.name}`
                    )
                );
            }
        }

        commands.push(`code '${solutionPath}' -r`);
        return commands;
    }

    private static mkdir(folder: string): string {
        return process.platform === "win32"
            ? `if (!(Test-Path '${folder}')) { New-Item -ItemType Directory -Path '${folder}' -Force | Out-Null }`
            : `mkdir -p '${folder}'`;
    }

    /**
     * Wraps a single command so its non-zero exit code prints a clear message
     * but does not abort the entire terminal session.
     *
     * On Windows we rely on `$LASTEXITCODE` (set by every external program)
     * because `$?` is clobbered by intervening control-flow statements such
     * as the `if` we emit below. On POSIX shells we use `||` short-circuit.
     */
    private static guard(command: string, label: string): string {
        const failMessage = `[csharp-toolbox] X Failed to ${label}.`;
        if (process.platform === "win32") {
            return `${command}; if ($LASTEXITCODE -ne 0) { Write-Host "${failMessage}" -ForegroundColor Red }`;
        }
        return `${command} || echo "${failMessage}"`;
    }

    /**
     * Chains multiple commands so each subsequent command only runs if the
     * previous one succeeded. On failure, prints a single line explaining
     * what went wrong (so the user isn't left with a wall of "Could not find
     * project" cascade errors).
     */
    private static chain(commands: string[], label: string): string {
        const failMessage = `[csharp-toolbox] X Failed to ${label} - skipping the rest of this project.`;
        if (process.platform === "win32") {
            const body = commands
                .map((cmd, idx) =>
                    idx === 0
                        ? cmd
                        : `if ($LASTEXITCODE -eq 0) { ${cmd} }`
                )
                .join("; ");
            return `${body}; if ($LASTEXITCODE -ne 0) { Write-Host "${failMessage}" -ForegroundColor Red }`;
        }
        return `${commands.join(" && ")} || echo "${failMessage}"`;
    }
}
