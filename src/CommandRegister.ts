import * as vscode from "vscode";
import { CreateProjectPanel } from "./resource/createProjectWebView/CreateProject";
import { SmartComments } from "./resource/smartComments/SmartComments";
import { ContextualMenu } from "./resource/contextualMenu/ContextualMenu";
import { AddProjectToSolution } from "./resource/addProjectToSolution/AddProjectToSolution";

/**
 * Singleton class to hold all CommandRegister configuration.
 * This class is used to register new commands available in the system.
 */
export class CommandRegister {
  private static _instance: CommandRegister | null = null;
  private readonly context: vscode.ExtensionContext;
  private framework: string;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.framework = context.globalState.get("framework") ?? "";
  }

  public static getInstance(context: vscode.ExtensionContext): CommandRegister {
    if (!CommandRegister._instance) {
      CommandRegister._instance = new CommandRegister(context);
    }
    return CommandRegister._instance;
  }

  /**
   * Initialize all commands
   */
  public initializeCommands(): void {
    this.registerCommand("csharp-snippet-productivity.createProject", async () => {
      CreateProjectPanel.createOrShow(this.context);
    });

    this.registerCommand(
      "csharp-snippet-productivity.addProjectToSolution",
      async (uri: vscode.Uri) => {
        AddProjectToSolution.init(uri, this.context);
      }
    );

    // Initialize smart comments
    this.activateSmartComments();

    // Initialize contextual menu
    this.activateContextualMenu();
  }

  /**
   * Activate SmartComments
   */
  private activateSmartComments(): void {
    const smartComment = new SmartComments(this.context);
    smartComment.activateSmartComments();
  }

  /**
   * Activate Contextual Menu
   */
  private activateContextualMenu(): void {
    const types = ["class", "interface", "struct", "record"];
    for (const type of types) {
      this.registerCommand(
        `csharp-snippet-productivity.create${type.charAt(0).toUpperCase() + type.slice(1)}`,
        async (uri: vscode.Uri) => {
          ContextualMenu.init(uri, type, this.framework);
        }
      );
    }
  }

  /**
   * Utility function to register a command
   * @param commandId - The ID of the command
   * @param callback - The callback function to execute when the command is triggered
   */
  private registerCommand(commandId: string, callback: (...args: any[]) => any): void {
    this.context.subscriptions.push(vscode.commands.registerCommand(commandId, callback));
  }
}
