import * as vscode from 'vscode';
import { CreateProjectPanel } from './createProject';
import { SmartComments } from './smartComments';

export function activate(context: vscode.ExtensionContext) {

    // smart comments activation
    let smartComment = new SmartComments(context);
    smartComment.activateSmartComments();

    context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createProject', async ()=> {
        CreateProjectPanel.createOrShow(context.extensionUri);
    }));
    
}

export function deactivate() { }