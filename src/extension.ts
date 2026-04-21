import * as vscode from "vscode";
import { CommandRegister } from "./CommandRegister";
import { Logger } from "./utils/logger";

/**
 * Extension activation entry point.
 *
 * Called by VS Code when one of the configured `activationEvents` fires.
 * Initialises the command registry which wires up all commands and
 * background features (smart comments, contextual menu, etc.).
 *
 * @param context - The extension context provided by VS Code, used to manage
 *   subscriptions and persisted state.
 */
export function activate(context: vscode.ExtensionContext): void {
    Logger.info("C# Toolbox extension activating...");
    try {
        const commands = CommandRegister.getInstance(context);
        commands.initializeCommands();
        Logger.info("C# Toolbox extension activated.");
    } catch (err) {
        Logger.error("Failed to activate C# Toolbox extension", err);
        throw err;
    }
}

/**
 * Extension deactivation hook.
 *
 * Called by VS Code when the extension is deactivated. Disposes shared
 * resources such as the output channel.
 */
export function deactivate(): void {
    Logger.info("C# Toolbox extension deactivating...");
    Logger.dispose();
}
