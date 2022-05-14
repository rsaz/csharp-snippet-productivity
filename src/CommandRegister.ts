import * as vscode from 'vscode';
import { CreateProjectPanel } from './resource/createProjectWebView/CreateProject';
import { SmartComments } from './resource/smartComments/SmartComments';
import { ContextualMenu } from './resource/contextualMenu/ContextualMenu';
import { AddProjectToSolution } from './resource/addProjectToSolution/AddProjectToSolution';

/**
 * Singleton class to hold all CommandRegister configuration
 * This class is used to register new CommandRegister available in the system
 */
export class CommandRegister {
    private static _instance: CommandRegister;
    private context!: vscode.ExtensionContext;
    private framework!: string;

    private constructor() {}
    
    public static getInstance(): CommandRegister {
        if (!CommandRegister._instance) {
            CommandRegister._instance = new CommandRegister();
        }
        return CommandRegister._instance;
    }

    // Initialize all commands
    public initializeCommands(context: vscode.ExtensionContext): void {
        this.context = context;


        this.createProject(context);
        this.addProjectToSolution();
        this.menuActivation();
        this.smartCommentsActivation();
    }

    // ****** Command registration ******
    private smartCommentsActivation(): void {
        let smartComment = new SmartComments(this.context);
        smartComment.activateSmartComments();
    }

    private createProject(context: vscode.ExtensionContext): void {
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createProject', async ()=> {
            CreateProjectPanel.createOrShow(this.context.extensionUri, this.context);
        }));
    }

    private menuActivation(): void {
        
        if (this.context.globalState.get("framework") !== undefined) {
            this.framework = this.context.globalState.get("framework") as string;
        }

        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createClass', async (uri: vscode.Uri)=> { 
            ContextualMenu.init(uri, 'class', this.framework);
        }));
    
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createInterface', async (uri: vscode.Uri)=> {
            ContextualMenu.init(uri, 'interface', this.framework);
        }));
        
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createStruct', async (uri: vscode.Uri)=> {
            ContextualMenu.init(uri, 'struct', this.framework);
        }));
        
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.createRecord', async (uri: vscode.Uri)=> {
            ContextualMenu.init(uri, 'record', this.framework);
        }));
    }

    private addProjectToSolution() {
        this.context.subscriptions.push(vscode.commands.registerCommand('csharp-snippet-productivity.addProjectToSolution', async (uri: vscode.Uri)=> {
            AddProjectToSolution.init(uri, this.context);
        }));
        
    }
}
