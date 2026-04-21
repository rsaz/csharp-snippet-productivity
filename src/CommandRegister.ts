import * as vscode from "vscode";
import { CreateProjectPanel } from "./resource/createProjectWebView/CreateProject";
import { SmartComments } from "./resource/smartComments/SmartComments";
import { ContextualMenu } from "./resource/contextualMenu/ContextualMenu";
import { AddProjectToSolution } from "./resource/addProjectToSolution/AddProjectToSolution";
import { ArchitectureScaffolder } from "./resource/architecture/ArchitectureScaffolder";
import {
    CLEAN_ARCHITECTURE_SCAFFOLD,
    DDD_SCAFFOLD,
} from "./resource/architecture/architecture-scaffolds";
import { NugetQuickAdd } from "./resource/nuget/NugetQuickAdd";
import { SolutionAnalyzer } from "./resource/solutionAnalyzer/SolutionAnalyzer";
import { PatternCodeActionProvider } from "./resource/codeActions/PatternCodeActionProvider";
import { COMMANDS, STATE_KEYS, WALKTHROUGH_ID, EXTENSION_ID } from "./utils/constants";
import { Logger } from "./utils/logger";

/**
 * Callback signature for VS Code command handlers.
 *
 * Uses `any[]` because VS Code's `commands.registerCommand` is variadic and
 * passes through whatever arguments the caller provides. Each handler narrows
 * its own arguments via TypeScript parameter types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CommandCallback = (...args: any[]) => unknown | Promise<unknown>;

/** File-scaffold types supported by the contextual menu. */
const SCAFFOLD_TYPES = ["class", "interface", "struct", "record"] as const;
type ScaffoldType = (typeof SCAFFOLD_TYPES)[number];

/**
 * Singleton that owns the lifecycle of every command contributed by the
 * extension. Construction is private; use {@link CommandRegister.getInstance}.
 *
 * Responsibilities:
 *  - Register all extension commands with VS Code.
 *  - Initialise long-lived feature controllers (smart comments, contextual menu).
 *  - Track per-session state such as the last selected target framework.
 */
export class CommandRegister {
    private static _instance: CommandRegister | null = null;
    private readonly context: vscode.ExtensionContext;
    private framework: string;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.framework =
            context.globalState.get<string>(STATE_KEYS.FRAMEWORK) ?? "";
    }

    /**
     * Returns the shared {@link CommandRegister} instance, creating it on
     * first call.
     */
    public static getInstance(
        context: vscode.ExtensionContext
    ): CommandRegister {
        if (!CommandRegister._instance) {
            CommandRegister._instance = new CommandRegister(context);
        }
        return CommandRegister._instance;
    }

    /**
     * Wires every command and feature module to VS Code. Safe to call once
     * per extension activation.
     */
    public initializeCommands(): void {
        this.registerCommand(COMMANDS.CREATE_PROJECT, async () => {
            CreateProjectPanel.createOrShow(this.context);
        });

        this.registerCommand(
            COMMANDS.ADD_PROJECT_TO_SOLUTION,
            async (uri: vscode.Uri) => {
                AddProjectToSolution.init(uri, this.context);
            }
        );

        this.registerCommand(
            COMMANDS.SCAFFOLD_CLEAN_ARCHITECTURE,
            async () => {
                await ArchitectureScaffolder.scaffold(
                    CLEAN_ARCHITECTURE_SCAFFOLD
                );
            }
        );

        this.registerCommand(COMMANDS.SCAFFOLD_DDD, async () => {
            await ArchitectureScaffolder.scaffold(DDD_SCAFFOLD);
        });

        this.registerCommand(
            COMMANDS.QUICK_ADD_NUGET,
            async (uri?: vscode.Uri) => {
                await NugetQuickAdd.run(uri);
            }
        );

        this.registerCommand(COMMANDS.ANALYZE_SOLUTION, async () => {
            await SolutionAnalyzer.run();
        });

        this.registerCommand(COMMANDS.OPEN_WALKTHROUGH, async () => {
            await vscode.commands.executeCommand(
                "workbench.action.openWalkthrough",
                `${EXTENSION_ID}#${WALKTHROUGH_ID}`,
                false
            );
        });

        this.activateSmartComments();
        this.activateContextualMenu();

        PatternCodeActionProvider.register(this.context);

        Logger.debug(`Registered ${SCAFFOLD_TYPES.length + 7} commands.`);
    }

    /**
     * Activates the SmartComments highlighter feature.
     */
    private activateSmartComments(): void {
        const smartComment = new SmartComments(this.context);
        smartComment.activateSmartComments();
    }

    /**
     * Registers contextual-menu file scaffold commands (Create Class,
     * Interface, Struct, Record).
     */
    private activateContextualMenu(): void {
        for (const type of SCAFFOLD_TYPES) {
            const commandId = this.getScaffoldCommandId(type);
            this.registerCommand(commandId, async (uri: vscode.Uri) => {
                ContextualMenu.init(uri, type, this.framework);
            });
        }
    }

    /**
     * Maps a scaffold type to its registered VS Code command identifier.
     */
    private getScaffoldCommandId(type: ScaffoldType): string {
        switch (type) {
            case "class": return COMMANDS.CREATE_CLASS;
            case "interface": return COMMANDS.CREATE_INTERFACE;
            case "struct": return COMMANDS.CREATE_STRUCT;
            case "record": return COMMANDS.CREATE_RECORD;
        }
    }

    /**
     * Registers a command with VS Code and pushes its disposable into the
     * extension context so it gets cleaned up on deactivate.
     *
     * @param commandId - Fully-qualified command identifier (e.g. `csharp-snippet-productivity.createClass`).
     * @param callback - Handler invoked when the command is executed.
     */
    private registerCommand(
        commandId: string,
        callback: CommandCallback
    ): void {
        this.context.subscriptions.push(
            vscode.commands.registerCommand(commandId, callback)
        );
    }
}
