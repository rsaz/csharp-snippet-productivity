import * as vscode from 'vscode';
import { CreateProjectPanel } from './resource/createProjectWebView/CreateProject';
import { SmartComments } from './resource/smartComments/SmartComments';
import { ContextualMenu } from './resource/contextualMenu/ContextualMenu';
import { TodoListProvider } from './resource/todoList/TodoListProvider';
import { COMMANDS, EXTENSION_ID, REGEX, TODO, VIEWS } from './resource/todoList/Constants';
import { Decoration } from './resource/todoList/Decoration';

/**
 * Singleton class to hold all CommandRegister configuration
 * This class is used to register new CommandRegister available in the system
 */
export class CommandRegister {
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
        //this.activateTodoList();
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

    private activateTodoList(): void {
        const todoListProvider = new TodoListProvider();
        let editor = vscode.window.activeTextEditor;

        vscode.window.registerTreeDataProvider(VIEWS.TODO_LIST, todoListProvider);
        Decoration.config(vscode.workspace.getConfiguration(EXTENSION_ID));
        styleText(editor);

        this.context.subscriptions.push(vscode.commands.registerCommand(COMMANDS.REFRESH, () => { todoListProvider.refresh(); }));
        this.context.subscriptions.push(
            vscode.commands.registerCommand(COMMANDS.OPEN_FILE, (uri: vscode.Uri, col: number) => {
              vscode.window.showTextDocument(uri)
                .then((editor: vscode.TextEditor) => {
                  const pos = new vscode.Position(col, 0);
                  editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
                  editor.selection = new vscode.Selection(pos, pos);
                });
            })
        );
        
        vscode.window.onDidChangeActiveTextEditor((e) => { if (e) { editor = e; styleText(e); }});
        vscode.workspace.onDidChangeTextDocument(() => { styleText(editor); });
        vscode.workspace.onDidSaveTextDocument(() => { todoListProvider.refresh();});
        vscode.workspace.onDidChangeConfiguration(async () => {
            Decoration.config(vscode.workspace.getConfiguration(EXTENSION_ID));
            styleText(editor);
            todoListProvider.refresh();
        });
    }
}

// supporting function to activate todo list
function styleText(editor: vscode.TextEditor | undefined) {
    if (!editor) {return;}
    const doc = editor.document;
    const str = doc.getText();
    let match;
  
    while ((match = REGEX.exec(str))) {
      editor.setDecorations(
        vscode.window.createTextEditorDecorationType(Decoration.decoration()),
        [new vscode.Range(doc.positionAt(match.index), doc.positionAt(match.index + TODO.length))]
      );
    }
  }