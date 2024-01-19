import * as vscode from "vscode";
import { CommandRegister } from "./CommandRegister";

/**
 * This method is called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
    const commands = CommandRegister.getInstance(context);
    commands.initializeCommands();
}

/**
 * This method is called when the extension is deactivated
 */
export function deactivate() {}
