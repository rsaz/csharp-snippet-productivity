import * as vscode from 'vscode';
import { CommandRegister } from './CommandRegister';

export function activate(context: vscode.ExtensionContext) {

    const commands = CommandRegister.getInstance();
    commands.initializeCommands(context);
}

export function deactivate() { }