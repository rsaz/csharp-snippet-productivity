import * as vscode from 'vscode';
import { CreateProjectPanel } from './createProject';
import { SmartComments } from './smartComments';
import { DocumentGenerator } from './createFile';

export function activate(context: vscode.ExtensionContext) {

    // smart comments activation
    let smartComment = new SmartComments(context);
    smartComment.activateSmartComments();

    context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createProject', async ()=> {
        CreateProjectPanel.createOrShow(context.extensionUri);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createClass', async (uri: vscode.Uri)=> {
        DocumentGenerator.init(uri, 'class');
    }));

    context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createInterface', async (uri: vscode.Uri)=> {
        DocumentGenerator.init(uri, 'interface');
    }));
    
}

export function deactivate() { }