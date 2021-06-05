import * as vscode from 'vscode';
import { CreateProjectPanel } from './resource/createProjectWebView/CreateProject';
import { SmartComments } from './resource/smartComments/SmartComments';
import { ContextualMenu } from './resource/contextualMenu/ContextualMenu';

/**
 * Singleton class to hold all CommandRegister configuration
 * This class is used to register new CommandRegister available in the system
 */
class CommandRegister {
    private static instance: CommandRegister;
    private context!: vscode.ExtensionContext;

    private constructor() {
    }
    
    public static getInstance(): CommandRegister {
        if (!CommandRegister.instance) {
            CommandRegister.instance = new CommandRegister();
        }
        return CommandRegister.instance;
    }

    // Initialize all CommandRegister
    public initializeCommands(context: vscode.ExtensionContext): void {
        this.context = context;

        this.createProject();
        this.menuActivation();
        this.smartCommentsActivation();
    }

    // ****** Command registration ******
    private smartCommentsActivation(): void {
        let smartComment = new SmartComments(this.context);
        smartComment.activateSmartComments();
    }

    private createProject(): void {
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createProject', async ()=> {
            CreateProjectPanel.createOrShow(this.context.extensionUri);
        }));
    }

    private menuActivation(): void {
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createClass', async (uri: vscode.Uri)=> {
            ContextualMenu.init(uri, 'class');
        }));
    
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createInterface', async (uri: vscode.Uri)=> {
            ContextualMenu.init(uri, 'interface');
        }));  
    }
}

export {CommandRegister};